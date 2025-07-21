package com.doctorplus.repository;

import com.doctorplus.domain.entity.Secretario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecretarioRepository extends JpaRepository<Secretario, Long> {

    Optional<Secretario> findByUsuarioId(Long usuarioId);

    @Query("SELECT s FROM Secretario s WHERE s.usuario.ativo = true")
    List<Secretario> findAllAtivos();

    @Query("SELECT s FROM Secretario s WHERE s.usuario.ativo = true AND " +
           "(LOWER(s.usuario.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(s.usuario.email) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Secretario> buscarPorTermo(@Param("termo") String termo);

    @Query("SELECT s FROM Secretario s WHERE s.usuario.ativo = true AND " +
           "s.id IN :secretarioIds AND " +
           "(LOWER(s.usuario.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(s.usuario.email) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Secretario> buscarPorTermoAccessible(@Param("termo") String termo, 
                                             @Param("secretarioIds") List<Long> secretarioIds);
    @Query("SELECT COUNT(s) FROM Secretario s WHERE s.usuario.ativo = true")
    Long countTotalSecretarios();

    @Query("SELECT COUNT(s) FROM Secretario s WHERE s.usuario.ativo = true AND s.id IN :secretarioIds")
    Long countAccessibleSecretarios(@Param("secretarioIds") List<Long> secretarioIds);

    // Métodos para controle de acesso
    @Query("SELECT s FROM Secretario s WHERE " +
           "s.usuario.ativo = true AND " +
           "(:secretarioIds IS NULL OR s.id IN :secretarioIds)")
    List<Secretario> findAccessibleSecretarios(@Param("secretarioIds") List<Long> secretarioIds);

    @Query("SELECT CASE WHEN COUNT(sp) > 0 THEN true ELSE false END " +
           "FROM SecretarioProfissional sp " +
           "JOIN sp.profissional.consultas c " +
           "WHERE sp.secretario.usuario.id = :usuarioId AND c.paciente.id = :pacienteId")
    boolean canAccessPaciente(@Param("usuarioId") Long usuarioId, @Param("pacienteId") Long pacienteId);

    @Query("SELECT DISTINCT c.paciente.id " +
           "FROM SecretarioProfissional sp " +
           "JOIN sp.profissional.consultas c " +
           "WHERE sp.secretario.usuario.id = :usuarioId")
    List<Long> getAccessiblePacienteIds(@Param("usuarioId") Long usuarioId);
}