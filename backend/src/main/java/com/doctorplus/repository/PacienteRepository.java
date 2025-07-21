package com.doctorplus.repository;

import com.doctorplus.domain.entity.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);

    List<Paciente> findByUsuarioId(Long usuarioId);

    @Query("SELECT p FROM Paciente p WHERE " +
           "LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "p.cpf LIKE CONCAT('%', :termo, '%') OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :termo, '%'))")
    Page<Paciente> buscarPorTermo(@Param("termo") String termo, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Paciente p")
    Long countTotalPacientes();

    @Query("SELECT COUNT(p) FROM Paciente p WHERE p.createdAt BETWEEN :inicio AND :fim")
    Long countPacientesNovos(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    // Métodos para controle de acesso
    @Query("SELECT p FROM Paciente p WHERE " +
           "(:pacienteIds IS NULL OR p.id IN :pacienteIds)")
    Page<Paciente> findAccessiblePacientes(@Param("pacienteIds") List<Long> pacienteIds, Pageable pageable);

    @Query("SELECT p FROM Paciente p WHERE " +
           "(:pacienteIds IS NULL OR p.id IN :pacienteIds) AND " +
           "(LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "p.cpf LIKE CONCAT('%', :termo, '%') OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :termo, '%')))")
    Page<Paciente> buscarPorTermoAccessible(@Param("termo") String termo, 
                                           @Param("pacienteIds") List<Long> pacienteIds, 
                                           Pageable pageable);

    @Query("SELECT p FROM Paciente p WHERE " +
           "(:pacienteIds IS NULL OR p.id IN :pacienteIds)")
    List<Paciente> findAccessiblePacientesSimples(@Param("pacienteIds") List<Long> pacienteIds);
}