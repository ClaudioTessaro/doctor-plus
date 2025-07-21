package com.doctorplus.controller;

import com.doctorplus.dto.response.ProfissionalResponse;
import com.doctorplus.service.ProfissionalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/profissionais")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Profissionais", description = "Gerenciamento de profissionais de saúde")
public class ProfissionalController {

    private final ProfissionalService profissionalService;

    @Autowired
    public ProfissionalController(ProfissionalService profissionalService) {
        this.profissionalService = profissionalService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar profissional por ID", description = "Retorna os dados de um profissional específico")
    public ResponseEntity<ProfissionalResponse> buscarPorId(@PathVariable UUID id) {
        ProfissionalResponse response = profissionalService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar todos os profissionais", description = "Retorna lista de todos os profissionais ativos")
    public ResponseEntity<List<ProfissionalResponse>> listarTodos() {
        List<ProfissionalResponse> response = profissionalService.listarTodos();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar profissionais", description = "Busca profissionais por nome, especialidade ou CRM")
    public ResponseEntity<List<ProfissionalResponse>> buscarPorTermo(@RequestParam String termo) {
        List<ProfissionalResponse> response = profissionalService.buscarPorTermo(termo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/especialidade/{especialidade}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar por especialidade", description = "Retorna profissionais filtrados por especialidade")
    public ResponseEntity<List<ProfissionalResponse>> listarPorEspecialidade(@PathVariable String especialidade) {
        List<ProfissionalResponse> response = profissionalService.listarPorEspecialidade(especialidade);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/especialidades")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar especialidades", description = "Retorna todas as especialidades disponíveis")
    public ResponseEntity<List<String>> listarEspecialidades() {
        List<String> response = profissionalService.listarEspecialidades();
        return ResponseEntity.ok(response);
    }
}