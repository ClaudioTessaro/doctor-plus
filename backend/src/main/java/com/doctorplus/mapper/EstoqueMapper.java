package com.doctorplus.mapper;

import com.doctorplus.domain.entity.Estoque;
import com.doctorplus.dto.request.EstoqueCreateRequest;
import com.doctorplus.dto.response.EstoqueResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProfissionalMapper.class})
public interface EstoqueMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profissional", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Estoque toEntity(EstoqueCreateRequest request);

    @Mapping(target = "estoqueBaixo", expression = "java(estoque.isEstoqueBaixo())")
    @Mapping(target = "esgotado", expression = "java(estoque.isEsgotado())")
    EstoqueResponse toResponse(Estoque estoque);

    List<EstoqueResponse> toResponseList(List<Estoque> estoques);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profissional", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(EstoqueCreateRequest request, @MappingTarget Estoque estoque);
}