import os
import threading
from datetime import datetime
from enum import Enum
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel

from tools import (
    hospital_search_tool,
    get_hospital_by_id_tool,
    doctor_search_tool,
    get_doctor_by_id_tool,
)

load_dotenv()


# ── Enums ──────────────────────────────────────────────────────────────────────

class Roles(Enum):
    USER      = "user"
    ASSISTANT = "assistant"
    SYSTEM    = "system"


# ── Request / Response Models ──────────────────────────────────────────────────

class ChatRequest(BaseModel):
    userId:    str
    message:   str
    role:      str = Roles.USER.value
    createdAt: str


class MessageResponse(BaseModel):
    content:   str
    id:        str
    role:      str
    createdAt: str


# ── FastAPI App ────────────────────────────────────────────────────────────────

app = FastAPI(title="MediFind Chat Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── LLM + Tools ───────────────────────────────────────────────────────────────

# llm = ChatGoogleGenerativeAI(
#     # model="gemini-2.0-flash",
#     model="gemini-1.5-flash",           
#     google_api_key=os.getenv("GOOGLE_API_KEY"),
# )

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",                  # ← change to this
    google_api_key=os.getenv("GEMINI_API_KEY"),
    # Optional: good defaults for your use-case
    temperature=0.7,
    max_output_tokens=1024,
)


TOOLS = [
    hospital_search_tool,
    get_hospital_by_id_tool,
    doctor_search_tool,
    get_doctor_by_id_tool,
]

llm_with_tools = llm.bind_tools(TOOLS)

TOOL_DICT = {t.name: t for t in TOOLS}


# ── Session Store ──────────────────────────────────────────────────────────────

user_messages: Dict[str, List] = {}
user_lock = threading.Lock()


# ── System Prompt ──────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are MediBot, a friendly AI assistant for the MediFind hospital directory.
You help users find hospitals and doctors using the tools available to you.

Available tools:
- hospital_search   : find hospitals by type, city, thana, name, or GPS location
- get_hospital_by_id: get full details of one hospital by its numeric ID
- doctor_search     : find doctors by specialty, name, city, or hospital
- get_doctor_by_id  : get full details of one doctor by their numeric ID

Guidelines:
- Always call a tool when the user asks about hospitals or doctors.
- For lists, summarise concisely: name, type/specialty, city, phone.
- For detail requests, show all relevant fields.
- Tolerate typos — the tools handle fuzzy matching automatically.
- If you need an ID to get details, first call the search tool to find it.
- Keep replies under 300 words unless the user asks for more.
- Use bullet points for lists.
- For booking appointments, tell the user to call the hospital/doctor directly.
- For general medical advice, answer helpfully but remind the user to consult a real doctor.

Available HOSPITAL_TYPE values:
PUBLIC, PRIVATE, GENERAL, SPECIALIZED, CHILDREN, MATERNITY, RESEARCH, REHABILITATION
""".strip()


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/", status_code=200)
async def root():
    return "Welcome to MediFind Chat Service!"


@app.get("/chat/v1/test", status_code=200)
async def health():
    return "Chat service is running!"


@app.post("/chat/v1/send", status_code=200, response_model=MessageResponse)
async def chat_endpoint(request: ChatRequest):
    user_id = request.userId
    message = request.message.strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    with user_lock:
        if user_id not in user_messages:
            user_messages[user_id] = [SystemMessage(content=SYSTEM_PROMPT)]
        messages = user_messages[user_id]

    messages.append(HumanMessage(content=message))

    # First LLM call
    try:
        ai_msg = llm_with_tools.invoke(messages)
    except Exception as e:
        # If you want to handle ResourceExhausted specifically, import exceptions and check type
        return MessageResponse(
            content="The service is currently experiencing high demand. Please try again shortly.",
            id="error_msg",
            role=Roles.ASSISTANT.value,
            createdAt=datetime.now().isoformat()
        )
    messages.append(ai_msg)

    # Tool-call loop (max 5 rounds)
    for _ in range(5):
        tool_calls = getattr(ai_msg, "tool_calls", [])
        if not tool_calls:
            break
        for tc in tool_calls:
            selected = TOOL_DICT.get(tc["name"])
            if selected:
                messages.append(selected.invoke(tc))
        ai_msg = llm_with_tools.invoke(messages)
        messages.append(ai_msg)

    with user_lock:
        user_messages[user_id] = messages

    reply = messages[-1].content or "Sorry, I couldn't generate a response."

    return MessageResponse(
        content   = reply,
        id        = f"{user_id}_assistant_{len(messages)}",
        role      = Roles.ASSISTANT.value,
        createdAt = datetime.now().isoformat(),
    )


@app.delete("/chat/v1/session/{user_id}", status_code=200)
async def clear_session(user_id: str):
    """Clear conversation history for a user (fresh start)."""
    with user_lock:
        user_messages.pop(user_id, None)
    return f"Session for '{user_id}' cleared."


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
