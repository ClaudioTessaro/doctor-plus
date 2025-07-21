package com.doctorplus.repository;

import com.doctorplus.domain.entity.Consulta;
import com.doctorplus.domain.enums.StatusConsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    List<Consulta> findByPacienteIdOrderByDataHoraDesc(Long pacienteId);

    List<Consulta> findByProfissionalIdOrderByDataHoraDesc(Long profissionalId);

    List<Consulta> findByStatus(StatusConsulta status);

    @Query("SELECT c FROM Consulta c WHERE c.dataHora BETWEEN :inicio AND :fim ORDER BY c.dataHora")
    List<Consulta> findByDataHoraBetween(@Param("inicio") LocalDateTime inicio, 
                                        @Param("fim") LocalDateTime fim);

    @Query("SELECT c FROM Consulta c WHERE c.profissional.id = :profissionalId " +
           "AND c.dataHora BETWEEN :inicio AND :fim ORDER BY c.dataHora")
    List<Consulta> findByProfissionalIdAndDataHoraBetween(@Param("profissionalId") Long profissionalId,
                                                          @Param("inicio") LocalDateTime inicio,
                                                          @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(c) FROM Consulta c WHERE c.dataHora BETWEEN :inicio AND :fim")
    Long countConsultasNoPeriodo(@Param("inicio") LocalDateTime inicio, 
                                @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(c) FROM Consulta c WHERE c.dataHora BETWEEN :inicio AND :fim AND c.profissional.id IN :profissionalIds")
    Long countAccessibleConsultasNoPeriodo(@Param("inicio") LocalDateTime inicio, 
                                          @Param("fim") LocalDateTime fim,
                                          @Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT c FROM Consulta c WHERE c.dataHora >= :agora AND c.status = 'AGENDADA' " +
           "ORDER BY c.dataHora LIMIT 5")
    List<Consulta> findProximasConsultas(@Param("agora") LocalDateTime agora);

    @Query("SELECT c FROM Consulta c WHERE c.dataHora >= :agora AND c.status = 'AGENDADA' " +
           "AND c.profissional.id IN :profissionalIds " +
           "ORDER BY c.dataHora LIMIT 5")
    List<Consulta> findProximasConsultasAccessible(@Param("agora") LocalDateTime agora,
                                                   @Param("profissionalIds") List<Long> profissionalIds);
    Long countByStatus(StatusConsulta status);

    @Query("SELECT COUNT(c) FROM Consulta c WHERE c.status = :status AND c.profissional.id IN :profissionalIds")
    Long countAccessibleByStatus(@Param("status") StatusConsulta status, @Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT COUNT(c) FROM Consulta c WHERE c.status = 'REALIZADA' AND c.dataHora BETWEEN :inicio AND :fim")
    Long countConsultasRealizadasMes(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(c) FROM Consulta c WHERE c.status = 'REALIZADA' AND c.dataHora BETWEEN :inicio AND :fim AND c.profissional.id IN :profissionalIds")
    Long countAccessibleConsultasRealizadasMes(@Param("inicio") LocalDateTime inicio, 
                                              @Param("fim") LocalDateTime fim,
                                              @Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT SUM(c.valor) FROM Consulta c WHERE c.status = 'REALIZADA' AND c.dataHora BETWEEN :inicio AND :fim")
    BigDecimal sumReceitaMes(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT SUM(c.valor) FROM Consulta c WHERE c.status = 'REALIZADA' AND c.dataHora BETWEEN :inicio AND :fim AND c.profissional.id IN :profissionalIds")
    BigDecimal sumAccessibleReceitaMes(@Param("inicio") LocalDateTime inicio, 
                                      @Param("fim") LocalDateTime fim,
                                      @Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT SUM(c.valor) FROM Consulta c WHERE c.status = 'REALIZADA' AND c.dataHora BETWEEN :inicio AND :fim")
    BigDecimal sumReceitaDia(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT SUM(c.valor) FROM Consulta c WHERE c.status = 'REALIZADA' AND c.dataHora BETWEEN :inicio AND :fim AND c.profissional.id IN :profissionalIds")
    BigDecimal sumAccessibleReceitaDia(@Param("inicio") LocalDateTime inicio, 
                                      @Param("fim") LocalDateTime fim,
                                      @Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT AVG(c.valor) FROM Consulta c WHERE c.status = 'REALIZADA' AND c.dataHora BETWEEN :inicio AND :fim AND c.valor IS NOT NULL")
    BigDecimal avgTicketMedio(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT AVG(c.valor) FROM Consulta c WHERE c.status = 'REALIZADA' AND c.dataHora BETWEEN :inicio AND :fim AND c.valor IS NOT NULL AND c.profissional.id IN :profissionalIds")
    BigDecimal avgAccessibleTicketMedio(@Param("inicio") LocalDateTime inicio, 
                                       @Param("fim") LocalDateTime fim,
                                       @Param("profissionalIds") List<Long> profissionalIds);

    // Métodos para controle de acesso
    @Query("SELECT c FROM Consulta c WHERE " +
           "c.dataHora BETWEEN :inicio AND :fim AND " +
           "(:profissionalIds IS NULL OR c.profissional.id IN :profissionalIds) " +
           "ORDER BY c.dataHora")
    List<Consulta> findAccessibleByDataHoraBetween(@Param("inicio") LocalDateTime inicio,
                                                  @Param("fim") LocalDateTime fim,
                                                  @Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT c FROM Consulta c WHERE " +
           "c.paciente.id = :pacienteId AND " +
           "(:profissionalIds IS NULL OR c.profissional.id IN :profissionalIds) " +
           "ORDER BY c.dataHora DESC")
    List<Consulta> findAccessibleByPacienteId(@Param("pacienteId") Long pacienteId,
                                             @Param("profissionalIds") List<Long> profissionalIds);
}