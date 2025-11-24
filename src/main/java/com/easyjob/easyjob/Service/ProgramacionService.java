package com.easyjob.easyjob.Service;

import com.easyjob.easyjob.Model.Programacion;
import com.easyjob.easyjob.Repository.ProgramacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ProgramacionService {

    @Autowired
    private ProgramacionRepository programacionRepository;

    public Programacion guardar(Programacion programacion) {
        return programacionRepository.save(programacion);
    }

    // ✅ OPTIMIZADO: Usar el método con JOIN FETCH
    public List<Programacion> listarTodas() {
        return programacionRepository.findAllWithRelations();
    }

    public void eliminar(Long id) {
        programacionRepository.deleteById(id);
    }

    public Optional<Programacion> buscarPorId(Long id) {
        return programacionRepository.findById(id);
    }

    public List<Programacion> listarPorEmpleado(Long idEmpleado) {
        return programacionRepository.findByUsuario_Idusuarios(idEmpleado);
    }

    // ✅ OPTIMIZADO: Usa la versión con JOIN FETCH
    public List<Programacion> listarPorSupervisor(Long idSupervisor) {
        return programacionRepository.findByZonaSupervisor(idSupervisor);
    }

    public List<Programacion> listarPorMes(Long idEmpleado, int year, int month) {
        LocalDate inicio = LocalDate.of(year, month, 1);
        LocalDate fin = inicio.withDayOfMonth(inicio.lengthOfMonth());
        return programacionRepository.findByUsuario_IdusuariosAndFechaBetween(idEmpleado, inicio, fin);
    }
}