package com.doctorplus.mapper;

import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.dto.request.UsuarioCreateRequest;
import com.doctorplus.dto.response.UsuarioResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senha", ignore = true)
    @Mapping(target = "oauthId", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "pacientes", ignore = true)
    @Mapping(target = "profissional", ignore = true)
    @Mapping(target = "secretario", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Usuario toEntity(UsuarioCreateRequest request);

    UsuarioResponse toResponse(Usuario usuario);

    List<UsuarioResponse> toResponseList(List<Usuario> usuarios);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senha", ignore = true)
    @Mapping(target = "oauthId", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "pacientes", ignore = true)
    @Mapping(target = "profissional", ignore = true)
    @Mapping(target = "secretario", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(UsuarioCreateRequest request, @MappingTarget Usuario usuario);
}