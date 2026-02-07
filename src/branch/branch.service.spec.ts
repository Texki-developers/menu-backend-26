import { Test, TestingModule } from '@nestjs/testing';
import { BranchService } from './branch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Branch } from './schemas';

import { NotFoundException } from '@nestjs/common';
import { OrganizationService } from 'src/organization/organization.service';

const mockBranch = {
    _id: 'branch123',
    name: 'Test Branch',
    code: 'BR001',
    organizationId: 'org123',
};

const mockOrganization = {
    _id: 'org123',
    slug: 'test-org',
};

const mockBranchModel = {
    create: jest.fn().mockResolvedValue(mockBranch),
    find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockBranch]),
    }),
    findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBranch),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBranch),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBranch),
    }),
    exists: jest.fn(),
};

const mockOrganizationService = {
    findBySlug: jest.fn(),
};

describe('BranchService', () => {
    let service: BranchService;
    let model: any;
    let orgService: OrganizationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BranchService,
                {
                    provide: getModelToken(Branch.name),
                    useValue: mockBranchModel,
                },
                {
                    provide: OrganizationService,
                    useValue: mockOrganizationService,
                },
            ],
        }).compile();

        service = module.get<BranchService>(BranchService);
        model = module.get(getModelToken(Branch.name));
        orgService = module.get<OrganizationService>(OrganizationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a branch successfully', async () => {
            const dto: any = {
                name: 'Test Branch',
                code: 'BR001',
                organizationSlug: 'test-org',
                geoLocation: { latitude: 10, longitude: 20 },
            };
            mockOrganizationService.findBySlug.mockResolvedValue(mockOrganization);

            const result = await service.create(dto);
            expect(result).toEqual(mockBranch);
            expect(orgService.findBySlug).toHaveBeenCalledWith('test-org');
            expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ organizationId: 'org123' }));
        });

        it('should throw NotFoundException if organization not found', async () => {
            mockOrganizationService.findBySlug.mockResolvedValue(null);
             const dto: any = {
                name: 'Test Branch',
                code: 'BR001',
                organizationSlug: 'not-found',
                geoLocation: { latitude: 10, longitude: 20 },
            };

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });
    });

    it('should find all branches', async () => {
        const result = await service.findAll();
        expect(result).toEqual([mockBranch]);
    });

    it('should find one branch', async () => {
        const result = await service.findOne('branch123');
        expect(result).toEqual(mockBranch);
    });
});
