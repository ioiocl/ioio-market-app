const LoginUseCase = require('../../../application/use-cases/auth/LoginUseCase');
const RegisterUseCase = require('../../../application/use-cases/auth/RegisterUseCase');

class AuthController {
  constructor(userRepository) {
    this.loginUseCase = new LoginUseCase(userRepository);
    this.registerUseCase = new RegisterUseCase(userRepository);
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: { message: 'Email and password are required' } 
        });
      }

      const result = await this.loginUseCase.execute(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: { message: error.message } });
    }
  }

  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: { message: 'Email and password are required' } 
        });
      }

      const result = await this.registerUseCase.execute({
        email,
        password,
        firstName,
        lastName
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async me(req, res) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }
}

module.exports = AuthController;
