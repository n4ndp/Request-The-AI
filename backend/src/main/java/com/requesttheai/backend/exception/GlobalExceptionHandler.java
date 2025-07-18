package com.requesttheai.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InsufficientCreditsException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientCreditsException(InsufficientCreditsException ex) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.PAYMENT_REQUIRED);
    }
}