package com.doctorplus.repository;

import com.doctorplus.domain.entity.Consulta;
import com.doctorplus.domain.enums.StatusConsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, UUID> {

    List<Consulta> findByPacienteIdOrderByDataHoraDesc(UUID pacienteId);

    List<Consulta> findByProfissionalIdOrderByDataHoraDesc(UUID profissionalId);

    List<Consulta> findByStatus(StatusConsulta status);

    @Query("SELECT c FROM Consulta c WHERE c.dataHora BETWEEN :inicio AND :fim ORDER BY c.dataHora")
    List<Consulta> findByDataHoraBetween(@Param("inicio") LocalDateTime inicio, 
                                        @Param("fim") LocalDateTime fim);

    @Query("SELECT c FROM Consulta c WHERE c.profissional.id = :profissionalId " +
           "AND c.dataHora BETWEEN :inicio AND :fim ORDER BY c.dataHora")
    List<Consulta> findByProfissionalIdAndDataHoraBetween(@Param("profissionalId") UUID profissionalId,
                                                          @Param("inicio") LocalDateTime inicio,
                                                          @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(c) FROM Consulta c WHERE c.dataHora BETWEEN :inicio AND :fim")
    Long countConsultasNoPeriodo(@Param("inicio") LocalDateTime inicio, 
                                @Param("fim") LocalDateTime fim);

    @Query("SELECT c FROM Consulta c WHERE c.dataHora >= :agora AND c.status = 'AGENDADA' " +
           "ORDER BY c.dataHora LIMIT 5")
    List<Consulta> findProximasConsultas(@Param("agora") LocalDateTime agora);
}