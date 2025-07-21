package com.doctorplus.controller;

import com.doctorplus.dto.request.PacienteCreateRequest;
import com.doctorplus.dto.response.PacienteResponse;
import com.doctorplus.dto.response.PageResponse;
import com.doctorplus.security.CurrentUser;
import com.doctorplus.security.UserPrincipal;
import com.doctorplus.service.PacienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pacientes")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Pacientes", description = "Gerenciamento de pacientes")
public class PacienteController {

    private final PacienteService pacienteService;

    @Autowired
    public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Criar paciente", description = "Cadastra um novo paciente")
    public ResponseEntity<PacienteResponse> criarPaciente(
            @Valid @RequestBody PacienteCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        PacienteResponse response = pacienteService.criarPaciente(request, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar paciente por ID", description = "Retorna os dados de um paciente específico")
    public ResponseEntity<PacienteResponse> buscarPorId(@PathVariable Long id,
                                                       @CurrentUser UserPrincipal currentUser) {
        PacienteResponse response = pacienteService.buscarPorId(id, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cpf/{cpf}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar paciente por CPF", description = "Retorna os dados de um paciente pelo CPF")
    public ResponseEntity<PacienteResponse> buscarPorCpf(@PathVariable String cpf,
                                                        @CurrentUser UserPrincipal currentUser) {
        PacienteResponse response = pacienteService.buscarPorCpf(cpf, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar pacientes paginados", description = "Retorna lista paginada de pacientes")
    public ResponseEntity<PageResponse<PacienteResponse>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nome") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @CurrentUser UserPrincipal currentUser) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PageResponse<PacienteResponse> response = pacienteService.listarTodos(pageable, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/simples")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar todos os pacientes simples", description = "Retorna lista simples de todos os pacientes para autocomplete")
    public ResponseEntity<List<PacienteResponse>> listarTodosSimples(@CurrentUser UserPrincipal currentUser) {
        List<PacienteResponse> response = pacienteService.listarTodosSimples(currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar pacientes paginados", description = "Busca pacientes por nome, CPF ou email com paginação")
    public ResponseEntity<PageResponse<PacienteResponse>> buscarPorTermo(
            @RequestParam String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @CurrentUser UserPrincipal currentUser) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome"));
        PageResponse<PacienteResponse> response = pacienteService.buscarPorTermo(termo, pageable, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Atualizar paciente", description = "Atualiza os dados de um paciente")
    public ResponseEntity<PacienteResponse> atualizarPaciente(
            @PathVariable Long id,
            @Valid @RequestBody PacienteCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        PacienteResponse response = pacienteService.atualizarPaciente(id, request, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Excluir paciente", description = "Remove um paciente do sistema")
    public ResponseEntity<Void> excluirPaciente(@PathVariable Long id,
                                               @CurrentUser UserPrincipal currentUser) {
        pacienteService.excluirPaciente(id, currentUser.getEmail());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estatisticas/total")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Total de pacientes", description = "Retorna o número total de pacientes cadastrados")
    public ResponseEntity<Long> contarTotalPacientes() {
        Long total = pacienteService.contarTotalPacientes();
        return ResponseEntity.ok(total);
    }
}