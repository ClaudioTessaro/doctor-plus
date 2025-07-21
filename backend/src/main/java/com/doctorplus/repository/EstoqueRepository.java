package com.doctorplus.repository;

import com.doctorplus.domain.entity.Estoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EstoqueRepository extends JpaRepository<Estoque, UUID> {

    Optional<Estoque> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Estoque> findByAtivoTrueOrderByNome();

    List<Estoque> findByCategoria(String categoria);

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND e.quantidade <= e.minAlerta")
    List<Estoque> findItensComEstoqueBaixo();

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND e.quantidade = 0")
    List<Estoque> findItensEsgotados();

    @Query("SELECT e FROM Estoque e WHERE e.ativo = true AND " +
           "(LOWER(e.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(e.codigo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(e.categoria) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Estoque> buscarPorTermo(@Param("termo") String termo);

    @Query("SELECT DISTINCT e.categoria FROM Estoque e WHERE e.categoria IS NOT NULL AND e.ativo = true")
    List<String> findAllCategorias();

    @Query("SELECT COUNT(e) FROM Estoque e WHERE e.ativo = true AND e.quantidade <= e.minAlerta")
    Long countItensComEstoqueBaixo();
}