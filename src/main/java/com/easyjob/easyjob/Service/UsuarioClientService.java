package com.easyjob.easyjob.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.easyjob.easyjob.DTO.UsuarioDTO;
import com.easyjob.easyjob.DTO.UsuarioApiDTO;
import com.easyjob.easyjob.DTO.UsuarioResponseDTO;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioClientService {

    @Autowired
    private RestTemplate restTemplate;

    public List<UsuarioDTO> listarUsuarios() {
        String url = "http://localhost:9090/api/usuarios/listar?modo=json";

        // Obtenemos la respuesta con la estructura de la API
        UsuarioResponseDTO respuesta = restTemplate.getForObject(url, UsuarioResponseDTO.class);

        if (respuesta == null || respuesta.getUsuarios() == null) {
            return null;
        }

        // Convertimos de UsuarioApiDTO a UsuarioDTO
        return respuesta.getUsuarios().stream()
                .map(this::convertirAUsuarioDTO)
                .collect(Collectors.toList());
    }

    // Método auxiliar para convertir UsuarioApiDTO a UsuarioDTO
    private UsuarioDTO convertirAUsuarioDTO(UsuarioApiDTO apiDTO) {
        String nombreCompleto = apiDTO.getNombre() + " " + apiDTO.getApellido();
        String sucursal = apiDTO.getSucursal() != null ? 
                         apiDTO.getSucursal().getNombreSucursal() : null;
        String rol = apiDTO.getRol() != null ? 
                    apiDTO.getRol().getTipoRol() : null;

        return new UsuarioDTO(
            apiDTO.getIdusuarios(),
            nombreCompleto,
            apiDTO.getCorreo(),
            apiDTO.getTelefono(),
            apiDTO.getDireccion(),
            apiDTO.getEstado(),
            apiDTO.getSalario(),
            sucursal,
            rol
        );
    }
}