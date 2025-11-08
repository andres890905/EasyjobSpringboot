package com.easyjob.easyjob.Service;



import com.easyjob.easyjob.Model.Programacion;
import com.easyjob.easyjob.Repository.ProgramacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProgramacionService {

    @Autowired
    private ProgramacionRepository programacionRepository;

    // Guardar o actualizar
    public Programacion guardar(Programacion p) {
        return programacionRepository.save(p);
    }

    // Listar todas las programaciones
    public List<Programacion> listarTodas() {
        return programacionRepository.findAll();
    }

    // Eliminar por ID
    public void eliminar(Long id) {
        programacionRepository.deleteById(id);
    }
}

