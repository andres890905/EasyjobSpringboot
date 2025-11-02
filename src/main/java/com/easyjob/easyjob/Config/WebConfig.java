package com.easyjob.easyjob.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private NoCacheInterceptor noCacheInterceptor;

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(noCacheInterceptor)
                .addPathPatterns("/dashboard_admin/**", "/dashboard_empleado/**", "/dashboard_supervisor/**"); // Aplica a todas las rutas
    }
}
