package com.doctorplus.service;

import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.domain.entity.Secretario;
import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.domain.enums.TipoUsuario;
import com.doctorplus.repository.ProfissionalRepository;
import com.doctorplus.repository.SecretarioProfissionalRepository;
import com.doctorplus.repository.SecretarioRepository;
import com.doctorplus.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SecurityService {

    private static final Logger logger = LoggerFactory.getLogger(SecurityService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProfissionalRepository profissionalRepository;

    @Autowired
    private SecretarioRepository secretarioRepository;

    @Autowired
    private SecretarioProfissionalRepository secretarioProfissionalRepository;

    /**
     * Verifica se o usuário é dono do recurso
     */
    public boolean isOwner(String email, Long resourceId) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            return usuario.isPresent() && usuario.get().getId().equals(resourceId);
        } catch (Exception e) {
            logger.error("Erro ao verificar propriedade do recurso", e);
            return false;
        }
    }

    /**
     * Verifica se o profissional pode acessar o paciente
     */
    public boolean canAccessPaciente(String email, Long pacienteId) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            if (usuario.isEmpty()) return false;

            // Admin pode acessar tudo
            if (usuario.get().getTipo() == TipoUsuario.ADMIN) {
                return true;
            }

            // Profissional pode acessar pacientes vinculados
            if (usuario.get().getTipo() == TipoUsuario.PROFISSIONAL) {
                return profissionalRepository.canAccessPaciente(usuario.get().getId(), pacienteId);
            }

            // Secretário pode acessar pacientes dos profissionais vinculados
            if (usuario.get().getTipo() == TipoUsuario.SECRETARIO) {
                return secretarioRepository.canAccessPaciente(usuario.get().getId(), pacienteId);
            }

            return false;
        } catch (Exception e) {
            logger.error("Erro ao verificar acesso ao paciente", e);
            return false;
        }
    }

    /**
     * Verifica se o usuário pode acessar o profissional
     */
    public boolean canAccessProfissional(String email, Long profissionalId) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            if (usuario.isEmpty()) return false;

            // Admin pode acessar tudo
            if (usuario.get().getTipo() == TipoUsuario.ADMIN) {
                return true;
            }

            // Profissional pode acessar apenas a si mesmo
            if (usuario.get().getTipo() == TipoUsuario.PROFISSIONAL) {
                Optional<Profissional> profissional = profissionalRepository.findByUsuarioId(usuario.get().getId());
                return profissional.isPresent() && profissional.get().getId().equals(profissionalId);
            }

            // Secretário pode acessar profissionais vinculados
            if (usuario.get().getTipo() == TipoUsuario.SECRETARIO) {
                Optional<Secretario> secretario = secretarioRepository.findByUsuarioId(usuario.get().getId());
                if (secretario.isPresent()) {
                    return secretarioProfissionalRepository.existsBySecretarioIdAndProfissionalId(
                        secretario.get().getId(), profissionalId);
                }
            }

            return false;
        } catch (Exception e) {
            logger.error("Erro ao verificar acesso ao profissional", e);
            return false;
        }
    }

    /**
     * Verifica se o usuário pode acessar o secretário
     */
    public boolean canAccessSecretario(String email, Long secretarioId) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            if (usuario.isEmpty()) return false;

            // Admin pode acessar tudo
            if (usuario.get().getTipo() == TipoUsuario.ADMIN) {
                return true;
            }

            // Profissional pode acessar secretários vinculados
            if (usuario.get().getTipo() == TipoUsuario.PROFISSIONAL) {
                Optional<Profissional> profissional = profissionalRepository.findByUsuarioId(usuario.get().getId());
                if (profissional.isPresent()) {
                    return secretarioProfissionalRepository.existsBySecretarioIdAndProfissionalId(
                        secretarioId, profissional.get().getId());
                }
            }

            // Secretário pode acessar apenas a si mesmo
            if (usuario.get().getTipo() == TipoUsuario.SECRETARIO) {
                Optional<Secretario> secretario = secretarioRepository.findByUsuarioId(usuario.get().getId());
                return secretario.isPresent() && secretario.get().getId().equals(secretarioId);
            }

            return false;
        } catch (Exception e) {
            logger.error("Erro ao verificar acesso ao secretário", e);
            return false;
        }
    }

    /**
     * Retorna lista de IDs de pacientes que o usuário pode acessar
     */
    public List<Long> getAccessiblePacienteIds(String email) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            if (usuario.isEmpty()) return List.of();

            // Admin pode acessar tudo
            if (usuario.get().getTipo() == TipoUsuario.ADMIN) {
                return null; // null significa "todos"
            }

            // Profissional pode acessar pacientes vinculados
            if (usuario.get().getTipo() == TipoUsuario.PROFISSIONAL) {
                return profissionalRepository.getAccessiblePacienteIds(usuario.get().getId());
            }

            // Secretário pode acessar pacientes dos profissionais vinculados
            if (usuario.get().getTipo() == TipoUsuario.SECRETARIO) {
                return secretarioRepository.getAccessiblePacienteIds(usuario.get().getId());
            }

            return List.of();
        } catch (Exception e) {
            logger.error("Erro ao buscar pacientes acessíveis", e);
            return List.of();
        }
    }

    /**
     * Retorna lista de IDs de profissionais que o usuário pode acessar
     */
    public List<Long> getAccessibleProfissionalIds(String email) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            if (usuario.isEmpty()) return List.of();

            // Admin pode acessar tudo
            if (usuario.get().getTipo() == TipoUsuario.ADMIN) {
                return null; // null significa "todos"
            }

            // Profissional pode acessar apenas a si mesmo
            if (usuario.get().getTipo() == TipoUsuario.PROFISSIONAL) {
                Optional<Profissional> profissional = profissionalRepository.findByUsuarioId(usuario.get().getId());
                return profissional.map(p -> List.of(p.getId())).orElse(List.of());
            }

            // Secretário pode acessar profissionais vinculados
            if (usuario.get().getTipo() == TipoUsuario.SECRETARIO) {
                Optional<Secretario> secretario = secretarioRepository.findByUsuarioId(usuario.get().getId());
                if (secretario.isPresent()) {
                    return secretarioProfissionalRepository.findBySecretarioId(secretario.get().getId())
                        .stream()
                        .map(sp -> sp.getProfissional().getId())
                        .toList();
                }
            }

            return List.of();
        } catch (Exception e) {
            logger.error("Erro ao buscar profissionais acessíveis", e);
            return List.of();
        }
    }

    /**
     * Retorna lista de IDs de secretários que o usuário pode acessar
     */
    public List<Long> getAccessibleSecretarioIds(String email) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            if (usuario.isEmpty()) return List.of();

            // Admin pode acessar tudo
            if (usuario.get().getTipo() == TipoUsuario.ADMIN) {
                return null; // null significa "todos"
            }

            // Profissional pode acessar secretários vinculados
            if (usuario.get().getTipo() == TipoUsuario.PROFISSIONAL) {
                Optional<Profissional> profissional = profissionalRepository.findByUsuarioId(usuario.get().getId());
                if (profissional.isPresent()) {
                    return secretarioProfissionalRepository.findByProfissionalId(profissional.get().getId())
                        .stream()
                        .map(sp -> sp.getSecretario().getId())
                        .toList();
                }
            }

            // Secretário pode acessar apenas a si mesmo
            if (usuario.get().getTipo() == TipoUsuario.SECRETARIO) {
                Optional<Secretario> secretario = secretarioRepository.findByUsuarioId(usuario.get().getId());
                return secretario.map(s -> List.of(s.getId())).orElse(List.of());
            }

            return List.of();
        } catch (Exception e) {
            logger.error("Erro ao buscar secretários acessíveis", e);
            return List.of();
        }
    }

    /**
     * Verifica se o usuário é administrador
     */
    public boolean isAdmin(String email) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            return usuario.isPresent() && usuario.get().getTipo() == TipoUsuario.ADMIN;
        } catch (Exception e) {
            logger.error("Erro ao verificar se é admin", e);
            return false;
        }
    }

    /**
     * Verifica se o usuário é profissional
     */
    public boolean isProfissional(String email) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            return usuario.isPresent() && usuario.get().getTipo() == TipoUsuario.PROFISSIONAL;
        } catch (Exception e) {
            logger.error("Erro ao verificar se é profissional", e);
            return false;
        }
    }
}