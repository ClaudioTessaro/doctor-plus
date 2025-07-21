package com.doctorplus.repository;

import com.doctorplus.domain.entity.SecretarioProfissional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecretarioProfissionalRepository extends JpaRepository<SecretarioProfissional, Long> {

    List<SecretarioProfissional> findBySecretarioId(Long secretarioId);

    List<SecretarioProfissional> findByProfissionalId(Long profissionalId);

    Optional<SecretarioProfissional> findBySecretarioIdAndProfissionalId(Long secretarioId, Long profissionalId);

    boolean existsBySecretarioIdAndProfissionalId(Long secretarioId, Long profissionalId);

    void deleteBySecretarioIdAndProfissionalId(Long secretarioId, Long profissionalId);
}