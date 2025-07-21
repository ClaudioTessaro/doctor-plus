package com.doctorplus.mapper;

import com.doctorplus.domain.entity.Consulta;
import com.doctorplus.dto.request.ConsultaCreateRequest;
import com.doctorplus.dto.response.ConsultaResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PacienteMapper.class, ProfissionalMapper.class})
public interface ConsultaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "profissional", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Consulta toEntity(ConsultaCreateRequest request);

    ConsultaResponse toResponse(Consulta consulta);

    List<ConsultaResponse> toResponseList(List<Consulta> consultas);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "profissional", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(ConsultaCreateRequest request, @MappingTarget Consulta consulta);
}