package com.doctorplus.config;

import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.domain.enums.TipoUsuario;
import com.doctorplus.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Order(1) // Executa primeiro
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDefaultAdmin();
    }

    private void createDefaultAdmin() {
        String adminEmail = "admin@doctorplus.com";
        
        if (!usuarioRepository.existsByEmail(adminEmail)) {
            Usuario admin = new Usuario();
            admin.setNome("Administrador DoctorPlus");
            admin.setEmail(adminEmail);
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setTipo(TipoUsuario.ADMIN);
            admin.setDataNascimento(LocalDate.of(1990, 1, 1));
            admin.setAtivo(true);

            usuarioRepository.save(admin);
            
            logger.info("=".repeat(60));
            logger.info("USUÁRIO ADMINISTRADOR CRIADO COM SUCESSO!");
            logger.info("Email: {}", adminEmail);
            logger.info("Senha: admin123");
            logger.info("ALTERE A SENHA APÓS O PRIMEIRO LOGIN!");
            logger.info("=".repeat(60));
        }
    }
}