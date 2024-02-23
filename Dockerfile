FROM postgres:latest


# You can adjust the user and password values
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin123


EXPOSE 5432


VOLUME /var/lib/postgresql/data