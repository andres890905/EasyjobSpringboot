package com.easyjob.easyjob.Service;



import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }
    
    // ✅ Nuevo método para guardar o actualizar un usuario
    public Usuario guardar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
 // ✅ NUEVO: Listar empleados de la zona del supervisor
    public List<Usuario> listarEmpleadosPorZonaSupervisor(Long idSupervisor) {
        return usuarioRepository.findByZonaSupervisor(idSupervisor);
    }
}

