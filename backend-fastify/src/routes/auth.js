import { User } from '../models/User.js';
import { NGO } from '../models/NGO.js';
import { Admin } from '../models/Admin.js';

export default async function authRoutes(fastify) {
  // Register Volunteer
  fastify.post('/auth/register/volunteer', {
    schema: {
      tags: ['Auth'],
      description: 'Register a new volunteer',
      body: {
        type: 'object',
        required: ['name', 'email', 'password', 'location'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          location: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { name, email, password, location } = request.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.code(409).send({ error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      location,
      role: 'volunteer',
    });

    const token = fastify.jwt.sign({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    reply.code(201).send({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  });

  // Login Volunteer
  fastify.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      description: 'Login as volunteer',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return reply.code(403).send({ error: 'Account is blocked' });
    }

    const token = fastify.jwt.sign({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    reply.send({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  });

  // Register NGO
  fastify.post('/auth/register/ngo', {
    schema: {
      tags: ['Auth'],
      description: 'Register a new NGO',
    },
  }, async (request, reply) => {
    const { name, email, password, organization } = request.body;

    const existingNGO = await NGO.findOne({ email });
    if (existingNGO) {
      return reply.code(409).send({ error: 'NGO already exists' });
    }

    const ngo = await NGO.create({
      name,
      email,
      password,
      organization,
      role: 'ngo',
    });

    const token = fastify.jwt.sign({
      id: ngo._id,
      email: ngo.email,
      role: ngo.role,
    });

    reply.code(201).send({
      success: true,
      message: 'NGO registered successfully',
      data: {
        token,
        ngo: {
          id: ngo._id,
          name: ngo.name,
          email: ngo.email,
          role: ngo.role,
        },
      },
    });
  });

  // Login NGO
  fastify.post('/auth/login-ngo', {
    schema: {
      tags: ['Auth'],
      description: 'Login as NGO',
    },
  }, async (request, reply) => {
    const { email, password } = request.body;

    const ngo = await NGO.findOne({ email }).select('+password');
    if (!ngo || !(await ngo.comparePassword(password))) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    if (ngo.status === 'blocked') {
      return reply.code(403).send({ error: 'Account is blocked' });
    }

    const token = fastify.jwt.sign({
      id: ngo._id,
      email: ngo.email,
      role: ngo.role,
    });

    reply.send({
      success: true,
      message: 'Login successful',
      data: {
        token,
        ngo: {
          id: ngo._id,
          name: ngo.name,
          email: ngo.email,
          role: ngo.role,
        },
      },
    });
  });

  // Admin Login
  fastify.post('/admin/login', {
    schema: {
      tags: ['Admin'],
      description: 'Login as admin',
    },
  }, async (request, reply) => {
    const { email, password } = request.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = fastify.jwt.sign({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    reply.send({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  });

  // Admin Register
  fastify.post('/admin/register', {
    schema: {
      tags: ['Admin'],
      description: 'Register a new admin (limited to 2)',
    },
  }, async (request, reply) => {
    const { name, email, password } = request.body;

    const adminCount = await Admin.countDocuments();
    if (adminCount >= 2) {
      return reply.code(400).send({ error: 'Maximum number of admins reached' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return reply.code(409).send({ error: 'Admin already exists' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: 'admin',
    });

    const token = fastify.jwt.sign({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    reply.code(201).send({
      success: true,
      message: 'Admin registered successfully',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  });
}
