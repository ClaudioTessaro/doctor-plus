package com.doctorplus.repository;

import com.doctorplus.domain.entity.Historico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoRepository extends JpaRepository<Historico, Long> {

    List<Historico> findAllByOrderByDataConsultaDesc();

    List<Historico> findByPacienteIdOrderByDataConsultaDesc(Long pacienteId);

    List<Historico> findByProfissionalIdOrderByDataConsultaDesc(Long profissionalId);

    @Query("SELECT h FROM Historico h WHERE " +
           "LOWER(h.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(h.diagnostico) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(h.paciente.nome) LIKE LOWER(CONCAT('%', :termo, '%'))")
    Page<Historico> buscarPorTermo(@Param("termo") String termo, Pageable pageable);

    @Query("SELECT COUNT(h) FROM Historico h")
    Long countTotalHistoricos();

    @Query("SELECT COUNT(h) FROM Historico h WHERE h.profissional.id IN :profissionalIds")
    Long countAccessibleHistoricos(@Param("profissionalIds") List<Long> profissionalIds);

    // Métodos para controle de acesso
    @Query("SELECT h FROM Historico h WHERE " +
           "(:profissionalIds IS NULL OR h.profissional.id IN :profissionalIds)")
    Page<Historico> findAccessibleHistoricos(@Param("profissionalIds") List<Long> profissionalIds, Pageable pageable);

    @Query("SELECT h FROM Historico h WHERE " +
           "(:profissionalIds IS NULL OR h.profissional.id IN :profissionalIds) " +
           "ORDER BY h.dataConsulta DESC")
    List<Historico> findAccessibleHistoricosSimples(@Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT h FROM Historico h WHERE " +
           "h.paciente.id = :pacienteId AND " +
           "(:profissionalIds IS NULL OR h.profissional.id IN :profissionalIds) " +
           "ORDER BY h.dataConsulta DESC")
    List<Historico> findAccessibleByPacienteId(@Param("pacienteId") Long pacienteId,
                                              @Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT h FROM Historico h WHERE " +
           "(:profissionalIds IS NULL OR h.profissional.id IN :profissionalIds) AND " +
           "(LOWER(h.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(h.diagnostico) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(h.paciente.nome) LIKE LOWER(CONCAT('%', :termo, '%')))")
    Page<Historico> buscarPorTermoAccessible(@Param("termo") String termo,
                                            @Param("profissionalIds") List<Long> profissionalIds,
                                            Pageable pageable);
}