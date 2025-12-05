package com.easyjob.easyjob.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyjob.easyjob.Service.UsuarioClientService;
import com.easyjob.easyjob.DTO.UsuarioDTO;

import java.util.List;


@RestController
@RequestMapping("/cliente")
public class UsuarioClienteController {

    @Autowired
    private UsuarioClientService usuarioClient;

    @GetMapping("/usuarios")
    public List<UsuarioDTO> listarUsuarios() {
        return usuarioClient.listarUsuarios();
    }
}
