package com.doctorplus.repository;

import com.doctorplus.domain.entity.Historico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HistoricoRepository extends JpaRepository<Historico, UUID> {

    List<Historico> findByPacienteIdOrderByDataConsultaDesc(UUID pacienteId);

    List<Historico> findByProfissionalIdOrderByDataConsultaDesc(UUID profissionalId);

    @Query("SELECT h FROM Historico h WHERE " +
           "LOWER(h.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(h.diagnostico) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(h.paciente.nome) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Historico> buscarPorTermo(@Param("termo") String termo);

    @Query("SELECT COUNT(h) FROM Historico h")
    Long countTotalHistoricos();
}