import axios from "axios";
// Phase 3: order-service on port 8084
const orderAxios = axios.create({ baseURL: "http://localhost:8084" });
orderAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["X-User-Id"] = user.userId;
    config.headers["X-User-Email"] = user.email;
    config.headers["X-User-Role"] = user.role;
  }
  return config;
});
export const orderApi = {
  placeOrder: (data) => orderAxios.post("/api/orders", data),
  myOrders: () => orderAxios.get("/api/orders"),
  getOrder: (id) => orderAxios.get(`/api/orders/${id}`),
};
// Usage in a React component:
// const handleOrder = async () => {
// const payload = {
// shippingAddress: '123 Dhaka',
// items: [{ productId: 'abc123', quantity: 2 }]
// };
// const { data } = await orderApi.placeOrder(payload);
// toast.success('Order placed: ' + data.id);
// };
