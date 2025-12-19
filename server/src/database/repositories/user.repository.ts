import { Sequelize, QueryTypes } from 'sequelize';
import { User, UserProfile, CreateUserData } from '../interfaces';

export class UserRepository {
    constructor(private sequelize: Sequelize) { }

    
    //   Find user by email for authentication purposes only.
     
    async findByEmailForAuth(email: string): Promise<User | null> {
        const result = await this.sequelize.query(
            `SELECT id, name, email, password, created_at, updated_at, created_by, updated_by
             FROM users WHERE email = :email LIMIT 1`,
            {
                replacements: { email },
                type: QueryTypes.SELECT,
            },
        );
        return result.length > 0 ? (result[0] as User) : null;
    }

    
    //  Find user by email for general purposes.
     
    async findByEmail(email: string): Promise<UserProfile | null> {
        const result = await this.sequelize.query(
            `SELECT id, name, email, created_at, updated_at, created_by, updated_by
             FROM users WHERE email = :email LIMIT 1`,
            {
                replacements: { email },
                type: QueryTypes.SELECT,
            },
        );
        return result.length > 0 ? (result[0] as UserProfile) : null;
    }

    async findById(userId: number): Promise<UserProfile | null> {
        const result = await this.sequelize.query(
            `SELECT id, name, email, created_at, updated_at
             FROM users WHERE id = :userId LIMIT 1`,
            {
                replacements: { userId },
                type: QueryTypes.SELECT,
            },
        );
        return result.length > 0 ? (result[0] as UserProfile) : null;
    }

    async create(userData: CreateUserData): Promise<UserProfile> {
        const { name, email, password } = userData;
        const result = await this.sequelize.query(
            `INSERT INTO users (name, email, password, created_at, updated_at) 
             VALUES (:name, :email, :password, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
             RETURNING id, name, email, created_at, updated_at`,
            {
                replacements: { name, email, password },
                type: QueryTypes.INSERT,
            },
        );
        return result[0][0] as UserProfile;
    }

    async findAll(): Promise<UserProfile[]> {
        const result = await this.sequelize.query(
            `SELECT id, name, email, created_at, updated_at 
             FROM users ORDER BY created_at DESC`,
            {
                type: QueryTypes.SELECT,
            },
        );
        return result as UserProfile[];
    }

    async getTotalCount(): Promise<number> {
        const result = await this.sequelize.query(`SELECT COUNT(*) as count FROM users`, {
            type: QueryTypes.SELECT,
        });
        return (result[0] as any).count;
    }

    async getActiveUsersLastWeek(): Promise<number> {
        const result = await this.sequelize.query(
            `SELECT COUNT(DISTINCT u.id) as count 
             FROM users u 
             WHERE u.updated_at > CURRENT_TIMESTAMP - INTERVAL '7 days'`,
            {
                type: QueryTypes.SELECT,
            },
        );
        return (result[0] as any).count;
    }
}
