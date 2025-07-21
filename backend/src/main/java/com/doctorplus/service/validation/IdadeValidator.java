package com.doctorplus.service.validation;

import com.doctorplus.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

@Component
public class IdadeValidator {

    private static final int IDADE_MINIMA = 18;

    public void validarIdadeMinima(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            throw new BusinessException("Data de nascimento é obrigatória");
        }

        LocalDate hoje = LocalDate.now();
        Period periodo = Period.between(dataNascimento, hoje);
        int idade = periodo.getYears();

        if (idade < IDADE_MINIMA) {
            throw new BusinessException("Usuário deve ser maior de 18 anos");
        }
    }

    public int calcularIdade(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            return 0;
        }

        LocalDate hoje = LocalDate.now();
        return Period.between(dataNascimento, hoje).getYears();
    }
}