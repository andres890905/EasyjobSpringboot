package com.easyjob.easyjob.Repository;

import com.easyjob.easyjob.Model.Programacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramacionRepository extends JpaRepository<Programacion, Long> {
}
