package com.doctorplus.controller;

import com.doctorplus.domain.enums.StatusConsulta;
import com.doctorplus.dto.request.ConsultaCreateRequest;
import com.doctorplus.dto.response.ConsultaResponse;
import com.doctorplus.service.ConsultaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/consultas")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Consultas", description = "Gerenciamento de consultas e agendamentos")
public class ConsultaController {

    private final ConsultaService consultaService;

    @Autowired
    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Agendar consulta", description = "Agenda uma nova consulta")
    public ResponseEntity<ConsultaResponse> agendarConsulta(@Valid @RequestBody ConsultaCreateRequest request) {
        ConsultaResponse response = consultaService.agendarConsulta(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar consulta por ID", description = "Retorna os dados de uma consulta específica")
    public ResponseEntity<ConsultaResponse> buscarPorId(@PathVariable UUID id) {
        ConsultaResponse response = consultaService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar consultas do paciente", description = "Retorna todas as consultas de um paciente")
    public ResponseEntity<List<ConsultaResponse>> listarPorPaciente(@PathVariable UUID pacienteId) {
        List<ConsultaResponse> response = consultaService.listarPorPaciente(pacienteId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profissional/{profissionalId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar consultas do profissional", description = "Retorna todas as consultas de um profissional")
    public ResponseEntity<List<ConsultaResponse>> listarPorProfissional(@PathVariable UUID profissionalId) {
        List<ConsultaResponse> response = consultaService.listarPorProfissional(profissionalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/periodo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar consultas por período", description = "Retorna consultas em um período específico")
    public ResponseEntity<List<ConsultaResponse>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<ConsultaResponse> response = consultaService.listarPorPeriodo(inicio, fim);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profissional/{profissionalId}/periodo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar consultas do profissional por período", 
               description = "Retorna consultas de um profissional em um período específico")
    public ResponseEntity<List<ConsultaResponse>> listarPorProfissionalEPeriodo(
            @PathVariable UUID profissionalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<ConsultaResponse> response = consultaService.listarPorProfissionalEPeriodo(profissionalId, inicio, fim);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/proximas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Próximas consultas", description = "Retorna as próximas consultas agendadas")
    public ResponseEntity<List<ConsultaResponse>> listarProximasConsultas() {
        List<ConsultaResponse> response = consultaService.listarProximasConsultas();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Atualizar consulta", description = "Atualiza os dados de uma consulta")
    public ResponseEntity<ConsultaResponse> atualizarConsulta(
            @PathVariable UUID id,
            @Valid @RequestBody ConsultaCreateRequest request) {
        ConsultaResponse response = consultaService.atualizarConsulta(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Alterar status da consulta", description = "Altera o status de uma consulta")
    public ResponseEntity<ConsultaResponse> alterarStatus(
            @PathVariable UUID id,
            @RequestParam StatusConsulta status) {
        ConsultaResponse response = consultaService.alterarStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Cancelar consulta", description = "Cancela uma consulta agendada")
    public ResponseEntity<Void> cancelarConsulta(@PathVariable UUID id) {
        consultaService.cancelarConsulta(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Confirmar consulta", description = "Confirma uma consulta agendada")
    public ResponseEntity<Void> confirmarConsulta(@PathVariable UUID id) {
        consultaService.confirmarConsulta(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/realizar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Marcar como realizada", description = "Marca uma consulta como realizada")
    public ResponseEntity<Void> marcarComoRealizada(@PathVariable UUID id) {
        consultaService.marcarComoRealizada(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estatisticas/total")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Total de consultas", description = "Retorna o número total de consultas")
    public ResponseEntity<Long> contarTotalConsultas() {
        Long total = consultaService.contarTotalConsultas();
        return ResponseEntity.ok(total);
    }
}