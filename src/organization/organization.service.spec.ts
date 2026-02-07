import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { getModelToken } from '@nestjs/mongoose';
import { Organization } from './schemas';
import { BranchService } from '../branch/branch.service';

const mockOrganization = {
    _id: '123',
    name: 'Test Org',
    slug: 'test-org',
    status: 'active',
};

const mockOrganizationModel = {
    create: jest.fn().mockResolvedValue(mockOrganization),
    find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockOrganization]),
        then: function(resolve) { resolve([mockOrganization]); }
    }),
    findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrganization),
    }),
    findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrganization),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrganization),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrganization),
    }),
};

const mockBranchService = {
    removeByOrganizationId: jest.fn().mockResolvedValue(undefined),
};

describe('OrganizationService', () => {
    let service: OrganizationService;
    let model: any;
    let branchService: BranchService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrganizationService,
                {
                    provide: getModelToken(Organization.name),
                    useValue: mockOrganizationModel,
                },
                {
                    provide: BranchService,
                    useValue: mockBranchService,
                },
            ],
        }).compile();

        service = module.get<OrganizationService>(OrganizationService);
        model = module.get(getModelToken(Organization.name));
        branchService = module.get<BranchService>(BranchService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create an organization', async () => {
        const dto = { name: 'Test Org', address: 'Dubai', currency: 'AED' as const, timezone: 'Asia/Dubai' as const };
        const result = await service.create(dto);
        expect(result).toEqual(mockOrganization);
        expect(model.create).toHaveBeenCalledWith(dto);
    });

    it('should find all organizations', async () => {
        const result = await service.findAll();
        expect(result).toEqual([mockOrganization]);
    });

    it('should find by slug', async () => {
        const result = await service.findBySlug('test-org');
        expect(result).toEqual(mockOrganization);
        expect(model.findOne).toHaveBeenCalledWith({ slug: 'test-org' });
    });

    it('should find one by id', async () => {
        const result = await service.findOne('123');
        expect(result).toEqual(mockOrganization);
        expect(model.findById).toHaveBeenCalledWith('123');
    });

    it('should update organization', async () => {
         const result = await service.update('123', { name: 'Updated' });
         expect(result).toEqual(mockOrganization);
         expect(model.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should remove organization and cascade branches', async () => {
        const result = await service.remove('123');
        expect(result).toEqual(mockOrganization);
        expect(model.findByIdAndDelete).toHaveBeenCalledWith('123');
        expect(branchService.removeByOrganizationId).toHaveBeenCalledWith('123');
    });
});
