package com.doctorplus.repository;

import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.domain.enums.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByOauthId(String oauthId);

    boolean existsByEmail(String email);

    boolean existsByOauthId(String oauthId);

    List<Usuario> findByTipoAndAtivoTrue(TipoUsuario tipo);

    @Query("SELECT u FROM Usuario u WHERE u.ativo = true")
    List<Usuario> findAllAtivos();

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.tipo = :tipo AND u.ativo = true")
    Long countByTipoAndAtivoTrue(@Param("tipo") TipoUsuario tipo);
}