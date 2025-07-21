package com.doctorplus.repository;

import com.doctorplus.domain.entity.Estoque;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstoqueRepository extends JpaRepository<Estoque, Long> {

    Optional<Estoque> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Estoque> findByAtivoTrueOrderByNome();

    Page<Estoque> findByAtivoTrue(Pageable pageable);

    List<Estoque> findByProfissionalIdAndAtivoTrueOrderByNome(Long profissionalId);

    Page<Estoque> findByProfissionalIdAndAtivoTrue(Long profissionalId, Pageable pageable);

    List<Estoque> findByProfissionalIdAndCategoria(Long profissionalId, String categoria);

    List<Estoque> findByCategoria(String categoria);

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND e.quantidade <= e.minAlerta AND " +
           "(:profissionalId IS NULL OR e.profissional.id = :profissionalId)")
    List<Estoque> findItensComEstoqueBaixo(@Param("profissionalId") Long profissionalId);

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND e.quantidade <= e.minAlerta")
    List<Estoque> findItensComEstoqueBaixo();

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND e.quantidade = 0 AND " +
           "(:profissionalId IS NULL OR e.profissional.id = :profissionalId)")
    List<Estoque> findItensEsgotados(@Param("profissionalId") Long profissionalId);

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND e.quantidade = 0")
    List<Estoque> findItensEsgotados();

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND " +
           "(:profissionalId IS NULL OR e.profissional.id = :profissionalId) AND " +
           "(LOWER(e.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(e.codigo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(e.categoria) LIKE LOWER(CONCAT('%', :termo, '%')))")
    Page<Estoque> buscarPorTermo(@Param("termo") String termo, @Param("profissionalId") Long profissionalId, Pageable pageable);

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND " +
           "(LOWER(e.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(e.codigo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(e.categoria) LIKE LOWER(CONCAT('%', :termo, '%')))")
    Page<Estoque> buscarPorTermo(@Param("termo") String termo, Pageable pageable);

    @Query("SELECT DISTINCT e.categoria FROM Estoque e WHERE e.categoria IS NOT NULL AND e.ativo = true AND " +
           "(:profissionalId IS NULL OR e.profissional.id = :profissionalId)")
    List<String> findAllCategorias(@Param("profissionalId") Long profissionalId);

    @Query("SELECT DISTINCT e.categoria FROM Estoque e WHERE e.categoria IS NOT NULL AND e.ativo = true")
    List<String> findAllCategorias();

    @Query("SELECT COUNT(e) FROM Estoque e WHERE e.ativo = true AND e.quantidade <= e.minAlerta AND " +
           "(:profissionalId IS NULL OR e.profissional.id = :profissionalId)")
    Long countItensComEstoqueBaixo(@Param("profissionalId") Long profissionalId);

    @Query("SELECT COUNT(e) FROM Estoque e WHERE e.ativo = true AND e.quantidade <= e.minAlerta")
    Long countItensComEstoqueBaixo();

    @Query("SELECT COUNT(e) FROM Estoque e WHERE e.ativo = true AND " +
           "(:profissionalId IS NULL OR e.profissional.id = :profissionalId)")
    Long countByAtivoTrue(@Param("profissionalId") Long profissionalId);

    Long countByAtivoTrue();

    @Query("SELECT COUNT(e) FROM Estoque e WHERE e.ativo = true AND e.quantidade = 0 AND " +
           "(:profissionalId IS NULL OR e.profissional.id = :profissionalId)")
    Long countItensEsgotados(@Param("profissionalId") Long profissionalId);

    @Query("SELECT COUNT(e) FROM Estoque e WHERE e.ativo = true AND e.quantidade = 0")
    Long countItensEsgotados();

    boolean existsByCodigoAndProfissionalId(String codigo, Long profissionalId);

    boolean existsByCodigoAndProfissionalIdIsNull(String codigo);
}