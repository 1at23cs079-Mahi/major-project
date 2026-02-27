import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Appointments (e2e)', () => {
  let app: INestApplication;
  let doctorToken: string;
  let patientToken: string;
  let adminToken: string;
  let patientId: string;
  let doctorId: string;
  let appointmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    
    app.setGlobalPrefix('api');
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@healthcare.com', password: 'Password123!' });
    adminToken = adminLogin.body.data.tokens.accessToken;

    // Login as doctor
    const doctorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'dr.smith@healthcare.com', password: 'Password123!' });
    doctorToken = doctorLogin.body.data.tokens.accessToken;
    doctorId = doctorLogin.body.data.user.doctor?.id;

    // Login as patient
    const patientLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'patient1@email.com', password: 'Password123!' });
    patientToken = patientLogin.body.data.tokens.accessToken;
    patientId = patientLogin.body.data.user.patient?.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/appointments (GET)', () => {
    it('should list appointments as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.items).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should list appointments as doctor', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.items).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/appointments')
        .expect(401);
    });
  });

  describe('/appointments (POST)', () => {
    it('should create an appointment', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId,
          doctorId,
          scheduledAt: tomorrow.toISOString(),
          duration: 30,
          type: 'IN_PERSON',
          reason: 'E2E Test Appointment',
          symptoms: ['Headache', 'Fatigue'],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reason).toBe('E2E Test Appointment');
      appointmentId = response.body.data.id;
    });

    it('should fail without required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId,
        })
        .expect(400);
    });
  });

  describe('/appointments/:id (GET)', () => {
    it('should get appointment by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(appointmentId);
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/appointments/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/appointments/:id/confirm (PATCH)', () => {
    it('should confirm an appointment', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/appointments/${appointmentId}/confirm`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('CONFIRMED');
    });
  });

  describe('/appointments/:id/complete (PATCH)', () => {
    it('should complete an appointment', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/appointments/${appointmentId}/complete`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ notes: 'Patient was seen and treated' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
    });
  });

  describe('/appointments/:id/cancel (PATCH)', () => {
    let cancelAppointmentId: string;

    beforeAll(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(14, 0, 0, 0);

      const response = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId,
          doctorId,
          scheduledAt: tomorrow.toISOString(),
          duration: 30,
          type: 'VIDEO',
          reason: 'To be cancelled',
        });

      cancelAppointmentId = response.body.data.id;
    });

    it('should cancel an appointment', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/appointments/${cancelAppointmentId}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Patient requested cancellation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('CANCELLED');
    });
  });
});
