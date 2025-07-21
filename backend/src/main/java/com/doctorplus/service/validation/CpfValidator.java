package com.doctorplus.service.validation;

import com.doctorplus.exception.BusinessException;
import org.springframework.stereotype.Component;

@Component
public class CpfValidator {

    public void validar(String cpf) {
        if (cpf == null || cpf.trim().isEmpty()) {
            throw new BusinessException("CPF é obrigatório");
        }

        // Remove caracteres não numéricos
        cpf = cpf.replaceAll("\\D", "");

        // Verifica se tem 11 dígitos
        if (cpf.length() != 11) {
            throw new BusinessException("CPF deve conter 11 dígitos");
        }

        // Verifica se todos os dígitos são iguais
        if (cpf.matches("(\\d)\\1{10}")) {
            throw new BusinessException("CPF inválido");
        }

        // Validação do algoritmo do CPF
        if (!validarDigitosVerificadores(cpf)) {
            throw new BusinessException("CPF inválido");
        }
    }

    private boolean validarDigitosVerificadores(String cpf) {
        try {
            // Calcula o primeiro dígito verificador
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
            }
            int primeiroDigito = 11 - (soma % 11);
            if (primeiroDigito >= 10) {
                primeiroDigito = 0;
            }

            // Verifica o primeiro dígito
            if (Character.getNumericValue(cpf.charAt(9)) != primeiroDigito) {
                return false;
            }

            // Calcula o segundo dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
            }
            int segundoDigito = 11 - (soma % 11);
            if (segundoDigito >= 10) {
                segundoDigito = 0;
            }

            // Verifica o segundo dígito
            return Character.getNumericValue(cpf.charAt(10)) == segundoDigito;

        } catch (Exception e) {
            return false;
        }
    }

    public String formatarCpf(String cpf) {
        if (cpf == null) {
            return null;
        }

        cpf = cpf.replaceAll("\\D", "");
        
        if (cpf.length() == 11) {
            return cpf.substring(0, 3) + "." + 
                   cpf.substring(3, 6) + "." + 
                   cpf.substring(6, 9) + "-" + 
                   cpf.substring(9, 11);
        }

        return cpf;
    }
}