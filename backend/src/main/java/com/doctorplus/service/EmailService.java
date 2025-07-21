package com.doctorplus.service;

import com.doctorplus.domain.entity.Consulta;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email}")
    private String fromEmail;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public void enviarConfirmacaoConsulta(Consulta consulta) {
        try {
            String assunto = "Confirmação de Consulta - DoctorPlus";
            String conteudo = construirEmailConfirmacao(consulta);
            
            enviarEmail(consulta.getPaciente().getEmail(), assunto, conteudo);
            logger.info("Email de confirmação enviado para: {}", consulta.getPaciente().getEmail());
            
        } catch (Exception e) {
            logger.error("Erro ao enviar email de confirmação: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar email", e);
        }
    }

    public void enviarCancelamentoConsulta(Consulta consulta) {
        try {
            String assunto = "Cancelamento de Consulta - DoctorPlus";
            String conteudo = construirEmailCancelamento(consulta);
            
            enviarEmail(consulta.getPaciente().getEmail(), assunto, conteudo);
            logger.info("Email de cancelamento enviado para: {}", consulta.getPaciente().getEmail());
            
        } catch (Exception e) {
            logger.error("Erro ao enviar email de cancelamento: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar email", e);
        }
    }

    public void enviarLembreteConsulta(Consulta consulta) {
        try {
            String assunto = "Lembrete de Consulta - DoctorPlus";
            String conteudo = construirEmailLembrete(consulta);
            
            enviarEmail(consulta.getPaciente().getEmail(), assunto, conteudo);
            logger.info("Email de lembrete enviado para: {}", consulta.getPaciente().getEmail());
            
        } catch (Exception e) {
            logger.error("Erro ao enviar email de lembrete: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar email", e);
        }
    }

    private void enviarEmail(String destinatario, String assunto, String conteudo) throws Exception {
        Email from = new Email(fromEmail);
        Email to = new Email(destinatario);
        Content content = new Content("text/html", conteudo);
        
        Mail mail = new Mail(from, assunto, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sg.api(request);
        
        if (response.getStatusCode() >= 400) {
            throw new RuntimeException("Erro ao enviar email: " + response.getBody());
        }
    }

    private String construirEmailConfirmacao(Consulta consulta) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563EB;">Consulta Confirmada - DoctorPlus</h2>
                    
                    <p>Olá <strong>%s</strong>,</p>
                    
                    <p>Sua consulta foi agendada com sucesso!</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #2563EB;">Detalhes da Consulta</h3>
                        <p><strong>Profissional:</strong> Dr. %s</p>
                        <p><strong>Especialidade:</strong> %s</p>
                        <p><strong>Data e Hora:</strong> %s</p>
                        <p><strong>Duração:</strong> %d minutos</p>
                        %s
                    </div>
                    
                    <p>Por favor, chegue com 15 minutos de antecedência.</p>
                    
                    <p>Em caso de dúvidas, entre em contato conosco.</p>
                    
                    <p>Atenciosamente,<br>
                    <strong>Equipe DoctorPlus</strong></p>
                </div>
            </body>
            </html>
            """,
            consulta.getPaciente().getNome(),
            consulta.getProfissional().getUsuario().getNome(),
            consulta.getProfissional().getEspecialidade(),
            consulta.getDataHora().format(dateFormatter),
            consulta.getDuracaoMinutos(),
            consulta.getObservacoes() != null ? 
                "<p><strong>Observações:</strong> " + consulta.getObservacoes() + "</p>" : ""
        );
    }

    private String construirEmailCancelamento(Consulta consulta) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc3545;">Consulta Cancelada - DoctorPlus</h2>
                    
                    <p>Olá <strong>%s</strong>,</p>
                    
                    <p>Informamos que sua consulta foi cancelada.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #dc3545;">Consulta Cancelada</h3>
                        <p><strong>Profissional:</strong> Dr. %s</p>
                        <p><strong>Data e Hora:</strong> %s</p>
                    </div>
                    
                    <p>Para reagendar, entre em contato conosco.</p>
                    
                    <p>Atenciosamente,<br>
                    <strong>Equipe DoctorPlus</strong></p>
                </div>
            </body>
            </html>
            """,
            consulta.getPaciente().getNome(),
            consulta.getProfissional().getUsuario().getNome(),
            consulta.getDataHora().format(dateFormatter)
        );
    }

    private String construirEmailLembrete(Consulta consulta) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563EB;">Lembrete de Consulta - DoctorPlus</h2>
                    
                    <p>Olá <strong>%s</strong>,</p>
                    
                    <p>Este é um lembrete da sua consulta agendada para amanhã.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #2563EB;">Detalhes da Consulta</h3>
                        <p><strong>Profissional:</strong> Dr. %s</p>
                        <p><strong>Data e Hora:</strong> %s</p>
                        <p><strong>Duração:</strong> %d minutos</p>
                    </div>
                    
                    <p>Lembre-se de chegar com 15 minutos de antecedência.</p>
                    
                    <p>Atenciosamente,<br>
                    <strong>Equipe DoctorPlus</strong></p>
                </div>
            </body>
            </html>
            """,
            consulta.getPaciente().getNome(),
            consulta.getProfissional().getUsuario().getNome(),
            consulta.getDataHora().format(dateFormatter),
            consulta.getDuracaoMinutos()
        );
    }
}