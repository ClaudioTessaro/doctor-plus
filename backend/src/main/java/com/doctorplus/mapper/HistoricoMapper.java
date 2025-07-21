package com.doctorplus.mapper;

import com.doctorplus.domain.entity.Historico;
import com.doctorplus.dto.request.HistoricoCreateRequest;
import com.doctorplus.dto.response.HistoricoResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PacienteMapper.class, ProfissionalMapper.class})
public interface HistoricoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "profissional", ignore = true)
    @Mapping(target = "arquivos", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Historico toEntity(HistoricoCreateRequest request);

    HistoricoResponse toResponse(Historico historico);

    List<HistoricoResponse> toResponseList(List<Historico> historicos);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "profissional", ignore = true)
    @Mapping(target = "arquivos", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromRequest(HistoricoCreateRequest request, @MappingTarget Historico historico);
}