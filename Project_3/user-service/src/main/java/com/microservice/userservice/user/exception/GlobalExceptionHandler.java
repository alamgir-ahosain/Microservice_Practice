// package com.microservice.userservice.user.exception;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.http.*;
// import org.springframework.web.bind.MethodArgumentNotValidException;
// import org.springframework.web.bind.annotation.*;
// import java.util.Map;

// @RestControllerAdvice
// public class GlobalExceptionHandler {

//     Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

//     @ExceptionHandler(RuntimeException.class)
//     public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
//         logger.error("GlobalExceptionHandler caught: {}", ex.getMessage()); // ← add this
//         return ResponseEntity
//                 .status(HttpStatus.BAD_REQUEST)
//                 .body(Map.of("message", ex.getMessage()));
//     }

//     @ExceptionHandler(MethodArgumentNotValidException.class)
//     public ResponseEntity<Map<String, String>> handleValidation(
//             MethodArgumentNotValidException ex) {
//         String msg = ex.getBindingResult().getFieldErrors().stream()
//                 .map(e -> e.getField() + ": " + e.getDefaultMessage())
//                 .findFirst().orElse("Validation error");
//         logger.error("Validation error: {}", msg);
//         return ResponseEntity.status(400).body(Map.of("message", msg));
//     }
// }