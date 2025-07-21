package com.doctorplus.mapper;

import com.doctorplus.domain.entity.Secretario;
import com.doctorplus.dto.response.SecretarioResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UsuarioMapper.class, SecretarioProfissionalMapper.class})
public interface SecretarioMapper {

    SecretarioResponse toResponse(Secretario secretario);

    List<SecretarioResponse> toResponseList(List<Secretario> secretarios);
}