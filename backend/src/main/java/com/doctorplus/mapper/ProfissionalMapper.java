package com.doctorplus.mapper;

import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.dto.response.ProfissionalResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UsuarioMapper.class})
public interface ProfissionalMapper {

    ProfissionalResponse toResponse(Profissional profissional);

    List<ProfissionalResponse> toResponseList(List<Profissional> profissionais);
}