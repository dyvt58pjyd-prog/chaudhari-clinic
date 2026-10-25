// Hospital Staff Authentication & Session Service
// Secure Username & Password credentials for Chaudhari Clinic

export const HOSPITAL_STAFF_ACCOUNTS = [
  {
    username: 'reception',
    password: 'reception@123',
    passwords: ['reception@123', 'clinic@123', 'admin@123'],
    name: 'Reception Desk Staff',
    role: 'reception', // 'reception', 'doctor', 'admin'
    department: 'Patient Admissions & Billing Counter',
    doctorId: null,
    avatar: '👩‍💼'
  },
  {
    username: 'dr.rajnikant',
    password: 'skin@123',
    passwords: ['skin@123', 'doctor@123'],
    name: 'Dr. Rajnikant Chaudhari',
    role: 'doctor',
    department: 'Dermatology, Trichology & Lasers',
    doctorId: 'dr-rajnikant',
    avatar: '👨‍⚕️'
  },
  {
    username: 'dr.priyanka',
    aliases: ['dr.priyanka', 'priyanka'],
    password: 'dental@123',
    passwords: ['dental@123', 'doctor@123'],
    name: 'Dr. Priyanka Chaudhari (Anokar)',
    role: 'doctor',
    department: 'Senior Dental Surgeon & Endodontist',
    doctorId: 'dr-priyanka',
    avatar: '👩‍⚕️'
  },
  {
    username: 'dr.shrutika',
    aliases: ['dr.shrutika', 'dr.rutika', 'shrutika', 'rutika'],
    password: 'pediatric@123',
    passwords: ['pediatric@123', 'smile@123', 'doctor@123'],
    name: 'Dr. Shrutika Tulaskar',
    role: 'doctor',
    department: 'Pediatric Dentistry & Smile Design',
    doctorId: 'dr-rutika',
    avatar: '👩‍⚕️'
  },
  {
    username: 'doctor',
    password: 'doctor@123',
    passwords: ['doctor@123', 'clinic@123'],
    name: 'Specialist Consulting Doctor',
    role: 'doctor',
    department: 'Clinical OPD Consultations',
    doctorId: 'dr-rajnikant',
    avatar: '👨‍⚕️'
  },
  {
    username: 'admin',
    password: 'admin@123',
    passwords: ['admin@123', 'clinic@123'],
    name: 'Hospital Administrator',
    role: 'admin',
    department: 'Executive Administration & Accounts',
    doctorId: null,
    avatar: '🛡️'
  }
];

const AUTH_STORAGE_KEY = 'CSD_AUTHENTICATED_STAFF_V2';

export class AuthService {
  constructor() {
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.error('Failed to load auth session:', e);
    }
    return null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  login(username, password) {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const account = HOSPITAL_STAFF_ACCOUNTS.find(acc => {
      const matchUser = acc.username.toLowerCase() === cleanUser || (Array.isArray(acc.aliases) && acc.aliases.includes(cleanUser));
      const validPasses = Array.isArray(acc.passwords) ? acc.passwords : [acc.password];
      const matchPass = validPasses.includes(cleanPass) || acc.password === cleanPass;
      return matchUser && matchPass;
    });

    if (account) {
      this.currentUser = {
        username: account.username,
        name: account.name,
        role: account.role,
        department: account.department,
        doctorId: account.doctorId,
        avatar: account.avatar,
        loggedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
        }
      } catch (e) {
        console.error('Failed to persist auth session:', e);
      }

      return { success: true, user: this.currentUser };
    }

    return {
      success: false,
      message: 'Invalid Username or Password. Please check the hospital staff credentials list below.'
    };
  }

  logout() {
    this.currentUser = null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to clear auth session:', e);
    }
    return true;
  }
}

export const authService = new AuthService();
