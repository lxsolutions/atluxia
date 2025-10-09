import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput, UpdateProductInput } from './dto/product.input';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip?: number, take?: number) {
    return this.prisma.product.findMany({
      skip,
      take,
      include: {
        offers: {
          include: {
            supplier_product: {
              include: {
                supplier: true,
              },
            },
          },
        },
        listings: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        offers: {
          include: {
            supplier_product: {
              include: {
                supplier: true,
              },
            },
          },
        },
        listings: true,
      },
    });
  }

  async findBySku(canonicalSku: string) {
    return this.prisma.product.findUnique({
      where: { canonical_sku: canonicalSku },
      include: {
        offers: {
          include: {
            supplier_product: {
              include: {
                supplier: true,
              },
            },
          },
        },
        listings: true,
      },
    });
  }

  async create(data: CreateProductInput) {
    return this.prisma.product.create({
      data: {
        ...data,
        images: data.images || [],
      },
    });
  }

  async update(id: string, data: UpdateProductInput) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async searchByText(query: string, skip?: number, take?: number) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip,
      take,
      include: {
        offers: {
          include: {
            supplier_product: {
              include: {
                supplier: true,
              },
            },
          },
        },
        listings: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}