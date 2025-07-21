package com.doctorplus.repository;

import com.doctorplus.domain.entity.Secretario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecretarioRepository extends JpaRepository<Secretario, UUID> {

    Optional<Secretario> findByUsuarioId(UUID usuarioId);

    @Query("SELECT s FROM Secretario s WHERE s.usuario.ativo = true")
    List<Secretario> findAllAtivos();

    @Query("SELECT s FROM Secretario s WHERE s.usuario.ativo = true AND " +
           "(LOWER(s.usuario.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(s.usuario.email) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Secretario> buscarPorTermo(@Param("termo") String termo);

    @Query("SELECT COUNT(s) FROM Secretario s WHERE s.usuario.ativo = true")
    Long countTotalSecretarios();
}