package com.doctorplus.mapper;

import com.doctorplus.domain.entity.Paciente;
import com.doctorplus.dto.request.PacienteCreateRequest;
import com.doctorplus.dto.response.PacienteResponse;
import com.doctorplus.service.validation.IdadeValidator;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class PacienteMapper {

    @Autowired
    protected IdadeValidator idadeValidator;

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "historicos", ignore = true)
    @Mapping(target = "consultas", ignore = true)
    @Mapping(target = "receitas", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Paciente toEntity(PacienteCreateRequest request);

    @Mapping(target = "idade", expression = "java(calcularIdade(paciente))")
    public abstract PacienteResponse toResponse(Paciente paciente);

    public abstract List<PacienteResponse> toResponseList(List<Paciente> pacientes);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "historicos", ignore = true)
    @Mapping(target = "consultas", ignore = true)
    @Mapping(target = "receitas", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void updateEntityFromRequest(PacienteCreateRequest request, @MappingTarget Paciente paciente);

    protected Integer calcularIdade(Paciente paciente) {
        return idadeValidator.calcularIdade(paciente.getDataNascimento());
    }
}