import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { NotFoundException } from '@nestjs/common';

const mockOrganizationService = {
    create: jest.fn().mockResolvedValue({ _id: '123', name: 'Test Org' }),
    findAll: jest.fn().mockResolvedValue([{ _id: '123', name: 'Test Org' }]),
    generateUniqueSlug: jest.fn().mockResolvedValue('test-org'),
    findBySlug: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('OrganizationController', () => {
    let controller: OrganizationController;
    let service: OrganizationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrganizationController],
            providers: [
                {
                    provide: OrganizationService,
                    useValue: mockOrganizationService,
                },
            ],
        }).compile();

        controller = module.get<OrganizationController>(OrganizationController);
        service = module.get<OrganizationService>(OrganizationService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create an organization', async () => {
        const dto = { name: 'Test Org', address: 'Dubai', currency: 'AED' as const, timezone: 'Asia/Dubai' as const };
        const result = await controller.create(dto);
        expect(result).toEqual({ _id: '123', name: 'Test Org' });
        expect(service.generateUniqueSlug).toHaveBeenCalledWith(dto.name);
        expect(service.create).toHaveBeenCalled();
    });

    it('should return all organizations', async () => {
        const result = await controller.getAll();
        expect(result).toHaveLength(1);
        expect(service.findAll).toHaveBeenCalled();
    });

    describe('findOne', () => {
        it('should return organization if found', async () => {
            mockOrganizationService.findOne.mockResolvedValue({ _id: '123' });
            const result = await controller.findOne('123');
            expect(result).toEqual({ _id: '123' });
        });

        it('should throw NotFoundException if not found', async () => {
            mockOrganizationService.findOne.mockResolvedValue(null);
            await expect(controller.findOne('123')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update organization if found', async () => {
            mockOrganizationService.update.mockResolvedValue({ _id: '123', name: 'Updated' });
            const result = await controller.update('123', { name: 'Updated' });
            expect(result).toEqual({ _id: '123', name: 'Updated' });
        });

        it('should throw NotFoundException if not found', async () => {
            mockOrganizationService.update.mockResolvedValue(null);
            await expect(controller.update('123', { name: 'Updated' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove organization if found', async () => {
            mockOrganizationService.remove.mockResolvedValue({ _id: '123' });
            const result = await controller.remove('123');
            expect(result).toEqual({ message: 'Organization deleted successfully' });
        });

         it('should throw NotFoundException if not found', async () => {
            mockOrganizationService.remove.mockResolvedValue(null);
            await expect(controller.remove('123')).rejects.toThrow(NotFoundException);
        });
    });
});
