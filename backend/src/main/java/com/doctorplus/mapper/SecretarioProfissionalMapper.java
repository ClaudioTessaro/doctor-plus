package com.doctorplus.mapper;

import com.doctorplus.domain.entity.SecretarioProfissional;
import com.doctorplus.dto.response.SecretarioProfissionalResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProfissionalMapper.class, SecretarioMapper.class})
public interface SecretarioProfissionalMapper {

    SecretarioProfissionalResponse toResponse(SecretarioProfissional secretarioProfissional);

    List<SecretarioProfissionalResponse> toResponseList(List<SecretarioProfissional> secretarioProfissionais);
}