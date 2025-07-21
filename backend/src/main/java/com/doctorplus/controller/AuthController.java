package com.doctorplus.controller;

import com.doctorplus.dto.request.LoginRequest;
import com.doctorplus.dto.request.UsuarioCreateRequest;
import com.doctorplus.dto.response.LoginResponse;
import com.doctorplus.dto.response.UsuarioResponse;
import com.doctorplus.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Endpoints para autenticação e registro")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Realizar login", description = "Autentica um usuário e retorna o token JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar usuário", description = "Cria uma nova conta de usuário")
    public ResponseEntity<UsuarioResponse> register(@Valid @RequestBody UsuarioCreateRequest request) {
        UsuarioResponse response = authService.registrar(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth/success")
    @Operation(summary = "Callback OAuth", description = "Processa login via OAuth2")
    public ResponseEntity<UsuarioResponse> oauthSuccess(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam String oauthId) {
        
        UsuarioResponse response = authService.processarLoginOAuth(email, name, oauthId);
        return ResponseEntity.ok(response);
    }
}