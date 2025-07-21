package com.doctorplus.repository;

import com.doctorplus.domain.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    Optional<Paciente> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);

    List<Paciente> findByUsuarioId(UUID usuarioId);

    @Query("SELECT p FROM Paciente p WHERE " +
           "LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "p.cpf LIKE CONCAT('%', :termo, '%') OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Paciente> buscarPorTermo(@Param("termo") String termo);

    @Query("SELECT COUNT(p) FROM Paciente p")
    Long countTotalPacientes();
}