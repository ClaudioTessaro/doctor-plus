package com.doctorplus.controller;

import com.doctorplus.dto.response.DashboardStatsResponse;
import com.doctorplus.security.CurrentUser;
import com.doctorplus.security.UserPrincipal;
import com.doctorplus.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dashboard", description = "Estatísticas e dados do dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Estatísticas do dashboard", description = "Retorna todas as estatísticas para o dashboard")
    public ResponseEntity<DashboardStatsResponse> getStats(@CurrentUser UserPrincipal currentUser) {
        DashboardStatsResponse stats = dashboardService.getStats(currentUser.getEmail());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/pacientes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Estatísticas de pacientes", description = "Retorna estatísticas detalhadas de pacientes")
    public ResponseEntity<DashboardStatsResponse.PacienteStats> getPacienteStats(@CurrentUser UserPrincipal currentUser) {
        DashboardStatsResponse.PacienteStats stats = dashboardService.getPacienteStats(currentUser.getEmail());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/consultas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Estatísticas de consultas", description = "Retorna estatísticas detalhadas de consultas")
    public ResponseEntity<DashboardStatsResponse.ConsultaStats> getConsultaStats(@CurrentUser UserPrincipal currentUser) {
        DashboardStatsResponse.ConsultaStats stats = dashboardService.getConsultaStats(currentUser.getEmail());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/financeiro")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Estatísticas financeiras", description = "Retorna estatísticas financeiras")
    public ResponseEntity<DashboardStatsResponse.FinanceiroStats> getFinanceiroStats(@CurrentUser UserPrincipal currentUser) {
        DashboardStatsResponse.FinanceiroStats stats = dashboardService.getFinanceiroStats(currentUser.getEmail());
        return ResponseEntity.ok(stats);
    }
}