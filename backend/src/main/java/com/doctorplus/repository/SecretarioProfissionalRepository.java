package com.doctorplus.repository;

import com.doctorplus.domain.entity.SecretarioProfissional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecretarioProfissionalRepository extends JpaRepository<SecretarioProfissional, UUID> {

    List<SecretarioProfissional> findBySecretarioId(UUID secretarioId);

    List<SecretarioProfissional> findByProfissionalId(UUID profissionalId);

    Optional<SecretarioProfissional> findBySecretarioIdAndProfissionalId(UUID secretarioId, UUID profissionalId);

    boolean existsBySecretarioIdAndProfissionalId(UUID secretarioId, UUID profissionalId);

    void deleteBySecretarioIdAndProfissionalId(UUID secretarioId, UUID profissionalId);
}