package com.doctorplus.repository;

import com.doctorplus.domain.entity.Profissional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfissionalRepository extends JpaRepository<Profissional, Long> {

    Optional<Profissional> findByUsuarioId(Long usuarioId);

    @Query("SELECT p FROM Profissional p WHERE p.usuario.email = :email")
    Optional<Profissional> findByUsuarioEmail(@Param("email") String email);

    Optional<Profissional> findByCrm(String crm);

    boolean existsByCrm(String crm);

    @Query("SELECT p FROM Profissional p WHERE p.usuario.ativo = true")
    List<Profissional> findAllAtivos();

    List<Profissional> findByEspecialidade(String especialidade);

    @Query("SELECT p FROM Profissional p WHERE " +
           "LOWER(p.especialidade) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(p.usuario.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "p.crm LIKE CONCAT('%', :termo, '%')")
    List<Profissional> buscarPorTermo(@Param("termo") String termo);

    @Query("SELECT DISTINCT p.especialidade FROM Profissional p WHERE p.usuario.ativo = true ORDER BY p.especialidade")
    List<String> findAllEspecialidades();

    @Query("SELECT COUNT(p) FROM Profissional p WHERE p.usuario.ativo = true")
    Long countTotalProfissionais();

    @Query("SELECT COUNT(p) FROM Profissional p WHERE p.usuario.ativo = true AND p.id IN :profissionalIds")
    Long countAccessibleProfissionais(@Param("profissionalIds") List<Long> profissionalIds);

    // Métodos para controle de acesso
    @Query("SELECT p FROM Profissional p WHERE " +
           "p.usuario.ativo = true AND " +
           "(:profissionalIds IS NULL OR p.id IN :profissionalIds)")
    List<Profissional> findAccessibleProfissionais(@Param("profissionalIds") List<Long> profissionalIds);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM Consulta c WHERE c.profissional.usuario.id = :usuarioId AND c.paciente.id = :pacienteId")
    boolean canAccessPaciente(@Param("usuarioId") Long usuarioId, @Param("pacienteId") Long pacienteId);

    @Query("SELECT DISTINCT c.paciente.id FROM Consulta c WHERE c.profissional.usuario.id = :usuarioId")
    List<Long> getAccessiblePacienteIds(@Param("usuarioId") Long usuarioId);
}