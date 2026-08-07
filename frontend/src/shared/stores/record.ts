import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export interface RecordItem {
  id: number
  categoryId: number
  tagIds: number[]
  note: string
  amount: number
  isAutomatic: boolean
  createdAt: string
  updatedAt: string
  occurredAt: string
}

export type RecordData = Omit<RecordItem, 'id' | 'createdAt' | 'updatedAt'>

type RecordSeed = Pick<
  RecordItem,
  'categoryId' | 'amount' | 'createdAt' | 'updatedAt' | 'occurredAt'
> & {
  tagIds?: number[]
  note?: string
  isAutomatic?: boolean
}

const recordSeeds: RecordSeed[] = [
  // 8/1：月初固定支出與三餐
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T08:07:00+08:00', updatedAt: '2026-08-01T08:07:00+08:00', categoryId: 13, amount: 15000, tagIds: [1301] },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T09:14:00+08:00', updatedAt: '2026-08-01T09:14:00+08:00', categoryId: 13, amount: 1800 },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T08:30:00+08:00', updatedAt: '2026-08-01T08:30:00+08:00', categoryId: 17, amount: 390, tagIds: [1703], note: 'Netflix', isAutomatic: true },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T08:30:00+08:00', updatedAt: '2026-08-01T08:30:00+08:00', categoryId: 17, amount: 169, note: 'Spotify', isAutomatic: true },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T08:30:00+08:00', updatedAt: '2026-08-01T08:30:00+08:00', categoryId: 17, amount: 90, note: 'iCloud 200GB', isAutomatic: true },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T13:42:00+08:00', updatedAt: '2026-08-01T13:42:00+08:00', categoryId: 17, amount: 599 },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T14:49:00+08:00', updatedAt: '2026-08-01T14:49:00+08:00', categoryId: 17, amount: 899 },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T15:56:00+08:00', updatedAt: '2026-08-01T15:56:00+08:00', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T16:03:00+08:00', updatedAt: '2026-08-01T16:03:00+08:00', categoryId: 7, amount: 125 },
  { occurredAt: '2026-08-01', createdAt: '2026-08-01T17:10:00+08:00', updatedAt: '2026-08-01T17:10:00+08:00', categoryId: 8, amount: 180 },

  // 8/2
  { occurredAt: '2026-08-02', createdAt: '2026-08-02T18:17:00+08:00', updatedAt: '2026-08-02T18:17:00+08:00', categoryId: 6, amount: 65 },
  { occurredAt: '2026-08-02', createdAt: '2026-08-02T19:24:00+08:00', updatedAt: '2026-08-02T19:24:00+08:00', categoryId: 7, amount: 140 },
  { occurredAt: '2026-08-02', createdAt: '2026-08-02T20:31:00+08:00', updatedAt: '2026-08-02T21:16:00+08:00', categoryId: 8, amount: 220 },
  { occurredAt: '2026-08-02', createdAt: '2026-08-02T08:38:00+08:00', updatedAt: '2026-08-02T08:38:00+08:00', categoryId: 9, amount: 70 },
  { occurredAt: '2026-08-02', createdAt: '2026-08-02T09:45:00+08:00', updatedAt: '2026-08-02T09:45:00+08:00', categoryId: 11, amount: 346, tagIds: [1101, 1102] },

  // 8/3
  { occurredAt: '2026-08-03', createdAt: '2026-08-04T10:52:00+08:00', updatedAt: '2026-08-04T10:52:00+08:00', categoryId: 1, amount: 52000, tagIds: [101], note: '八月薪水' },
  { occurredAt: '2026-08-03', createdAt: '2026-08-03T11:59:00+08:00', updatedAt: '2026-08-03T11:59:00+08:00', categoryId: 6, amount: 50 },
  { occurredAt: '2026-08-03', createdAt: '2026-08-03T12:06:00+08:00', updatedAt: '2026-08-03T12:06:00+08:00', categoryId: 7, amount: 115 },
  { occurredAt: '2026-08-03', createdAt: '2026-08-03T13:13:00+08:00', updatedAt: '2026-08-03T13:13:00+08:00', categoryId: 8, amount: 160 },
  { occurredAt: '2026-08-03', createdAt: '2026-08-03T14:20:00+08:00', updatedAt: '2026-08-03T14:20:00+08:00', categoryId: 10, amount: 60 },

  // 8/4
  { occurredAt: '2026-08-04', createdAt: '2026-08-04T15:27:00+08:00', updatedAt: '2026-08-04T15:27:00+08:00', categoryId: 6, amount: 45 },
  { occurredAt: '2026-08-04', createdAt: '2026-08-04T16:34:00+08:00', updatedAt: '2026-08-04T16:34:00+08:00', categoryId: 7, amount: 120 },
  { occurredAt: '2026-08-04', createdAt: '2026-08-04T17:41:00+08:00', updatedAt: '2026-08-04T17:41:00+08:00', categoryId: 8, amount: 135 },

  // 8/5
  { occurredAt: '2026-08-05', createdAt: '2026-08-05T18:48:00+08:00', updatedAt: '2026-08-05T18:48:00+08:00', categoryId: 6, amount: 75 },
  { occurredAt: '2026-08-05', createdAt: '2026-08-05T19:55:00+08:00', updatedAt: '2026-08-05T19:55:00+08:00', categoryId: 7, amount: 130 },
  { occurredAt: '2026-08-05', createdAt: '2026-08-05T20:02:00+08:00', updatedAt: '2026-08-05T20:47:00+08:00', categoryId: 8, amount: 190 },
  { occurredAt: '2026-08-05', createdAt: '2026-08-05T08:09:00+08:00', updatedAt: '2026-08-05T08:09:00+08:00', categoryId: 9, amount: 55 },
  { occurredAt: '2026-08-05', createdAt: '2026-08-05T09:16:00+08:00', updatedAt: '2026-08-05T09:16:00+08:00', categoryId: 10, amount: 60 },
  { occurredAt: '2026-08-05', createdAt: '2026-08-05T10:23:00+08:00', updatedAt: '2026-08-05T10:23:00+08:00', categoryId: 20, amount: 980, tagIds: [2001, 2003] },

  // 8/6
  { occurredAt: '2026-08-06', createdAt: '2026-08-06T11:30:00+08:00', updatedAt: '2026-08-06T11:30:00+08:00', categoryId: 6, amount: 60 },
  { occurredAt: '2026-08-06', createdAt: '2026-08-06T12:37:00+08:00', updatedAt: '2026-08-06T12:37:00+08:00', categoryId: 7, amount: 115 },
  { occurredAt: '2026-08-06', createdAt: '2026-08-06T13:44:00+08:00', updatedAt: '2026-08-06T13:44:00+08:00', categoryId: 8, amount: 250 },
  { occurredAt: '2026-08-06', createdAt: '2026-08-06T14:51:00+08:00', updatedAt: '2026-08-06T14:51:00+08:00', categoryId: 12, amount: 299 },

  // 8/7
  { occurredAt: '2026-08-07', createdAt: '2026-08-07T15:58:00+08:00', updatedAt: '2026-08-07T15:58:00+08:00', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-07', createdAt: '2026-08-07T16:05:00+08:00', updatedAt: '2026-08-07T16:05:00+08:00', categoryId: 7, amount: 135 },
  { occurredAt: '2026-08-07', createdAt: '2026-08-07T17:12:00+08:00', updatedAt: '2026-08-07T17:12:00+08:00', categoryId: 8, amount: 175 },
  { occurredAt: '2026-08-07', createdAt: '2026-08-07T18:19:00+08:00', updatedAt: '2026-08-07T18:19:00+08:00', categoryId: 9, amount: 65 },

  // 8/8：睡過頭，沒吃早餐
  { occurredAt: '2026-08-08', createdAt: '2026-08-08T19:26:00+08:00', updatedAt: '2026-08-08T19:26:00+08:00', categoryId: 7, amount: 180 },
  { occurredAt: '2026-08-08', createdAt: '2026-08-08T20:33:00+08:00', updatedAt: '2026-08-08T21:18:00+08:00', categoryId: 8, amount: 420 },
  { occurredAt: '2026-08-08', createdAt: '2026-08-08T08:40:00+08:00', updatedAt: '2026-08-08T08:40:00+08:00', categoryId: 12, amount: 360, tagIds: [1201], note: 'IMAX' },
  { occurredAt: '2026-08-08', createdAt: '2026-08-08T09:47:00+08:00', updatedAt: '2026-08-08T09:47:00+08:00', categoryId: 10, amount: 265 },

  // 8/9
  { occurredAt: '2026-08-09', createdAt: '2026-08-09T10:54:00+08:00', updatedAt: '2026-08-09T10:54:00+08:00', categoryId: 6, amount: 80 },
  { occurredAt: '2026-08-09', createdAt: '2026-08-09T11:01:00+08:00', updatedAt: '2026-08-09T11:01:00+08:00', categoryId: 7, amount: 150 },
  { occurredAt: '2026-08-09', createdAt: '2026-08-09T12:08:00+08:00', updatedAt: '2026-08-09T12:08:00+08:00', categoryId: 8, amount: 210 },
  { occurredAt: '2026-08-09', createdAt: '2026-08-09T13:15:00+08:00', updatedAt: '2026-08-09T13:15:00+08:00', categoryId: 19, amount: 1088, tagIds: [1901] },
  { occurredAt: '2026-08-09', createdAt: '2026-08-09T14:22:00+08:00', updatedAt: '2026-08-09T14:22:00+08:00', categoryId: 11, amount: 259 },

  // 8/10
  { occurredAt: '2026-08-10', createdAt: '2026-08-11T15:29:00+08:00', updatedAt: '2026-08-11T15:29:00+08:00', categoryId: 6, amount: 50 },
  { occurredAt: '2026-08-10', createdAt: '2026-08-10T16:36:00+08:00', updatedAt: '2026-08-10T16:36:00+08:00', categoryId: 7, amount: 120 },
  { occurredAt: '2026-08-10', createdAt: '2026-08-10T17:43:00+08:00', updatedAt: '2026-08-10T17:43:00+08:00', categoryId: 8, amount: 155 },
  { occurredAt: '2026-08-10', createdAt: '2026-08-10T18:50:00+08:00', updatedAt: '2026-08-10T18:50:00+08:00', categoryId: 10, amount: 60 },

  // 8/11
  { occurredAt: '2026-08-11', createdAt: '2026-08-11T19:57:00+08:00', updatedAt: '2026-08-11T19:57:00+08:00', categoryId: 6, amount: 65 },
  { occurredAt: '2026-08-11', createdAt: '2026-08-11T20:04:00+08:00', updatedAt: '2026-08-11T20:49:00+08:00', categoryId: 7, amount: 135 },
  { occurredAt: '2026-08-11', createdAt: '2026-08-11T08:11:00+08:00', updatedAt: '2026-08-11T08:11:00+08:00', categoryId: 8, amount: 180 },
  { occurredAt: '2026-08-11', createdAt: '2026-08-11T09:18:00+08:00', updatedAt: '2026-08-11T09:18:00+08:00', categoryId: 14, amount: 200, note: '感冒' },
  { occurredAt: '2026-08-11', createdAt: '2026-08-11T10:25:00+08:00', updatedAt: '2026-08-11T10:25:00+08:00', categoryId: 14, amount: 160, tagIds: [1402] },

  // 8/12
  { occurredAt: '2026-08-12', createdAt: '2026-08-12T11:32:00+08:00', updatedAt: '2026-08-12T11:32:00+08:00', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-12', createdAt: '2026-08-12T12:39:00+08:00', updatedAt: '2026-08-12T12:39:00+08:00', categoryId: 7, amount: 110 },
  { occurredAt: '2026-08-12', createdAt: '2026-08-12T13:46:00+08:00', updatedAt: '2026-08-12T13:46:00+08:00', categoryId: 8, amount: 145 },
  { occurredAt: '2026-08-12', createdAt: '2026-08-12T14:53:00+08:00', updatedAt: '2026-08-12T14:53:00+08:00', categoryId: 15, amount: 680, tagIds: [1501, 1503] },

  // 8/13
  { occurredAt: '2026-08-13', createdAt: '2026-08-13T15:00:00+08:00', updatedAt: '2026-08-13T15:00:00+08:00', categoryId: 6, amount: 90 },
  { occurredAt: '2026-08-13', createdAt: '2026-08-13T16:07:00+08:00', updatedAt: '2026-08-13T16:07:00+08:00', categoryId: 7, amount: 155 },
  { occurredAt: '2026-08-13', createdAt: '2026-08-13T17:14:00+08:00', updatedAt: '2026-08-13T17:14:00+08:00', categoryId: 8, amount: 240 },
  { occurredAt: '2026-08-13', createdAt: '2026-08-13T18:21:00+08:00', updatedAt: '2026-08-13T18:21:00+08:00', categoryId: 9, amount: 75 },
  { occurredAt: '2026-08-13', createdAt: '2026-08-13T19:28:00+08:00', updatedAt: '2026-08-13T19:28:00+08:00', categoryId: 11, amount: 1280, note: '補充洗衣精、垃圾袋、廚房紙巾還有幾個收納盒，提著回家才發現超級重' },

  // 8/14
  { occurredAt: '2026-08-14', createdAt: '2026-08-14T20:35:00+08:00', updatedAt: '2026-08-14T21:20:00+08:00', categoryId: 6, amount: 45 },
  { occurredAt: '2026-08-14', createdAt: '2026-08-14T08:42:00+08:00', updatedAt: '2026-08-14T08:42:00+08:00', categoryId: 7, amount: 105 },
  { occurredAt: '2026-08-14', createdAt: '2026-08-14T09:49:00+08:00', updatedAt: '2026-08-14T09:49:00+08:00', categoryId: 8, amount: 130 },

  // 8/15：週末小旅行
  { occurredAt: '2026-08-15', createdAt: '2026-08-15T10:56:00+08:00', updatedAt: '2026-08-15T10:56:00+08:00', categoryId: 6, amount: 75 },
  { occurredAt: '2026-08-15', createdAt: '2026-08-15T11:03:00+08:00', updatedAt: '2026-08-15T11:03:00+08:00', categoryId: 7, amount: 200 },
  { occurredAt: '2026-08-15', createdAt: '2026-08-15T12:10:00+08:00', updatedAt: '2026-08-15T12:10:00+08:00', categoryId: 8, amount: 360 },
  { occurredAt: '2026-08-15', createdAt: '2026-08-15T13:17:00+08:00', updatedAt: '2026-08-15T13:17:00+08:00', categoryId: 16, amount: 1350 },
  { occurredAt: '2026-08-15', createdAt: '2026-08-15T14:24:00+08:00', updatedAt: '2026-08-15T14:24:00+08:00', categoryId: 16, amount: 2400, tagIds: [1602], note: '台南兩天一夜' },
  { occurredAt: '2026-08-15', createdAt: '2026-08-15T15:31:00+08:00', updatedAt: '2026-08-15T15:31:00+08:00', categoryId: 9, amount: 60 },

  // 8/16
  { occurredAt: '2026-08-16', createdAt: '2026-08-16T16:38:00+08:00', updatedAt: '2026-08-16T16:38:00+08:00', categoryId: 6, amount: 80 },
  { occurredAt: '2026-08-16', createdAt: '2026-08-16T17:45:00+08:00', updatedAt: '2026-08-16T17:45:00+08:00', categoryId: 7, amount: 160 },
  { occurredAt: '2026-08-16', createdAt: '2026-08-16T18:52:00+08:00', updatedAt: '2026-08-16T18:52:00+08:00', categoryId: 8, amount: 260 },
  { occurredAt: '2026-08-16', createdAt: '2026-08-16T19:59:00+08:00', updatedAt: '2026-08-16T19:59:00+08:00', categoryId: 16, amount: 200 },
  { occurredAt: '2026-08-16', createdAt: '2026-08-16T20:06:00+08:00', updatedAt: '2026-08-16T20:51:00+08:00', categoryId: 16, amount: 580, tagIds: [1604] },

  // 8/17
  { occurredAt: '2026-08-17', createdAt: '2026-08-17T08:13:00+08:00', updatedAt: '2026-08-17T08:13:00+08:00', categoryId: 6, amount: 50 },
  { occurredAt: '2026-08-17', createdAt: '2026-08-17T09:20:00+08:00', updatedAt: '2026-08-17T09:20:00+08:00', categoryId: 7, amount: 120 },
  { occurredAt: '2026-08-17', createdAt: '2026-08-17T10:27:00+08:00', updatedAt: '2026-08-17T10:27:00+08:00', categoryId: 8, amount: 150 },
  { occurredAt: '2026-08-17', createdAt: '2026-08-17T11:34:00+08:00', updatedAt: '2026-08-17T11:34:00+08:00', categoryId: 5, amount: 690, tagIds: [501], note: '尺寸不合' },
  { occurredAt: '2026-08-17', createdAt: '2026-08-18T12:41:00+08:00', updatedAt: '2026-08-18T12:41:00+08:00', categoryId: 10, amount: 60 },

  // 8/18
  { occurredAt: '2026-08-18', createdAt: '2026-08-18T13:48:00+08:00', updatedAt: '2026-08-18T13:48:00+08:00', categoryId: 6, amount: 60 },
  { occurredAt: '2026-08-18', createdAt: '2026-08-18T14:55:00+08:00', updatedAt: '2026-08-18T14:55:00+08:00', categoryId: 7, amount: 130 },
  { occurredAt: '2026-08-18', createdAt: '2026-08-18T15:02:00+08:00', updatedAt: '2026-08-18T15:02:00+08:00', categoryId: 8, amount: 175 },

  // 8/19
  { occurredAt: '2026-08-19', createdAt: '2026-08-19T16:09:00+08:00', updatedAt: '2026-08-19T16:09:00+08:00', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-19', createdAt: '2026-08-19T17:16:00+08:00', updatedAt: '2026-08-19T17:16:00+08:00', categoryId: 7, amount: 145 },
  { occurredAt: '2026-08-19', createdAt: '2026-08-19T18:23:00+08:00', updatedAt: '2026-08-19T18:23:00+08:00', categoryId: 8, amount: 190 },
  { occurredAt: '2026-08-19', createdAt: '2026-08-19T19:30:00+08:00', updatedAt: '2026-08-19T19:30:00+08:00', categoryId: 4, amount: 2200, tagIds: [402] },
  { occurredAt: '2026-08-19', createdAt: '2026-08-19T20:37:00+08:00', updatedAt: '2026-08-19T21:22:00+08:00', categoryId: 9, amount: 80 },

  // 8/20
  { occurredAt: '2026-08-20', createdAt: '2026-08-20T08:44:00+08:00', updatedAt: '2026-08-20T08:44:00+08:00', categoryId: 6, amount: 70 },
  { occurredAt: '2026-08-20', createdAt: '2026-08-20T09:51:00+08:00', updatedAt: '2026-08-20T09:51:00+08:00', categoryId: 7, amount: 125 },
  { occurredAt: '2026-08-20', createdAt: '2026-08-20T10:58:00+08:00', updatedAt: '2026-08-20T10:58:00+08:00', categoryId: 8, amount: 210 },
  { occurredAt: '2026-08-20', createdAt: '2026-08-20T11:05:00+08:00', updatedAt: '2026-08-20T11:05:00+08:00', categoryId: 18, amount: 890, tagIds: [1801, 1804] },

  // 8/21
  { occurredAt: '2026-08-21', createdAt: '2026-08-21T12:12:00+08:00', updatedAt: '2026-08-21T12:12:00+08:00', categoryId: 6, amount: 50 },
  { occurredAt: '2026-08-21', createdAt: '2026-08-21T13:19:00+08:00', updatedAt: '2026-08-21T13:19:00+08:00', categoryId: 7, amount: 115 },
  { occurredAt: '2026-08-21', createdAt: '2026-08-21T14:26:00+08:00', updatedAt: '2026-08-21T14:26:00+08:00', categoryId: 8, amount: 180 },
  { occurredAt: '2026-08-21', createdAt: '2026-08-21T15:33:00+08:00', updatedAt: '2026-08-21T15:33:00+08:00', categoryId: 3, amount: 128, tagIds: [301] },

  // 8/22
  { occurredAt: '2026-08-22', createdAt: '2026-08-22T16:40:00+08:00', updatedAt: '2026-08-22T16:40:00+08:00', categoryId: 6, amount: 65 },
  { occurredAt: '2026-08-22', createdAt: '2026-08-22T17:47:00+08:00', updatedAt: '2026-08-22T17:47:00+08:00', categoryId: 7, amount: 135 },
  { occurredAt: '2026-08-22', createdAt: '2026-08-22T18:54:00+08:00', updatedAt: '2026-08-22T18:54:00+08:00', categoryId: 8, amount: 220 },
  { occurredAt: '2026-08-22', createdAt: '2026-08-22T19:01:00+08:00', updatedAt: '2026-08-22T19:01:00+08:00', categoryId: 11, amount: 1680, tagIds: [1101, 1102], note: '網購小邊桌和床頭燈，商品照片看起來很小，實際收到比想像中大很多' },
  { occurredAt: '2026-08-22', createdAt: '2026-08-22T20:08:00+08:00', updatedAt: '2026-08-22T20:53:00+08:00', categoryId: 13, amount: 245 },

  // 8/23：晚起，沒吃早餐
  { occurredAt: '2026-08-23', createdAt: '2026-08-23T08:15:00+08:00', updatedAt: '2026-08-23T08:15:00+08:00', categoryId: 7, amount: 260 },
  { occurredAt: '2026-08-23', createdAt: '2026-08-23T09:22:00+08:00', updatedAt: '2026-08-23T09:22:00+08:00', categoryId: 8, amount: 390 },
  { occurredAt: '2026-08-23', createdAt: '2026-08-23T10:29:00+08:00', updatedAt: '2026-08-23T10:29:00+08:00', categoryId: 20, amount: 650, tagIds: [2002], note: '年度預防針' },
  { occurredAt: '2026-08-23', createdAt: '2026-08-23T11:36:00+08:00', updatedAt: '2026-08-23T11:36:00+08:00', categoryId: 9, amount: 95 },

  // 8/24
  { occurredAt: '2026-08-24', createdAt: '2026-08-24T12:43:00+08:00', updatedAt: '2026-08-24T12:43:00+08:00', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-24', createdAt: '2026-08-24T13:50:00+08:00', updatedAt: '2026-08-24T13:50:00+08:00', categoryId: 7, amount: 120 },
  { occurredAt: '2026-08-24', createdAt: '2026-08-24T14:57:00+08:00', updatedAt: '2026-08-24T14:57:00+08:00', categoryId: 8, amount: 160 },
  { occurredAt: '2026-08-24', createdAt: '2026-08-24T15:04:00+08:00', updatedAt: '2026-08-24T15:04:00+08:00', categoryId: 13, amount: 1680, tagIds: [1302], note: '七月水電' },
  { occurredAt: '2026-08-24', createdAt: '2026-08-24T16:11:00+08:00', updatedAt: '2026-08-24T16:11:00+08:00', categoryId: 10, amount: 30 },

  // 8/25
  { occurredAt: '2026-08-25', createdAt: '2026-08-25T17:18:00+08:00', updatedAt: '2026-08-25T17:18:00+08:00', categoryId: 6, amount: 60 },
  { occurredAt: '2026-08-25', createdAt: '2026-08-25T18:25:00+08:00', updatedAt: '2026-08-25T18:25:00+08:00', categoryId: 7, amount: 145 },
  { occurredAt: '2026-08-25', createdAt: '2026-08-25T19:32:00+08:00', updatedAt: '2026-08-25T19:32:00+08:00', categoryId: 8, amount: 190 },
  { occurredAt: '2026-08-25', createdAt: '2026-08-25T20:39:00+08:00', updatedAt: '2026-08-25T21:24:00+08:00', categoryId: 17, amount: 650, tagIds: [1702, 1704], note: 'Figma 與雲端服務' },

  // 8/26
  { occurredAt: '2026-08-26', createdAt: '2026-08-26T08:46:00+08:00', updatedAt: '2026-08-26T08:46:00+08:00', categoryId: 6, amount: 45 },
  { occurredAt: '2026-08-26', createdAt: '2026-08-26T09:53:00+08:00', updatedAt: '2026-08-26T09:53:00+08:00', categoryId: 7, amount: 130 },
  { occurredAt: '2026-08-26', createdAt: '2026-08-26T10:00:00+08:00', updatedAt: '2026-08-26T10:00:00+08:00', categoryId: 8, amount: 170 },
  { occurredAt: '2026-08-26', createdAt: '2026-08-27T11:07:00+08:00', updatedAt: '2026-08-27T11:07:00+08:00', categoryId: 14, amount: 200, tagIds: [1403] },

  // 8/27
  { occurredAt: '2026-08-27', createdAt: '2026-08-27T12:14:00+08:00', updatedAt: '2026-08-27T12:14:00+08:00', categoryId: 6, amount: 85 },
  { occurredAt: '2026-08-27', createdAt: '2026-08-27T13:21:00+08:00', updatedAt: '2026-08-27T13:21:00+08:00', categoryId: 7, amount: 150 },
  { occurredAt: '2026-08-27', createdAt: '2026-08-27T14:28:00+08:00', updatedAt: '2026-08-27T14:28:00+08:00', categoryId: 8, amount: 230 },
  { occurredAt: '2026-08-27', createdAt: '2026-08-27T15:35:00+08:00', updatedAt: '2026-08-27T15:35:00+08:00', categoryId: 15, amount: 1800, tagIds: [1502], note: '線上設計課' },
  { occurredAt: '2026-08-27', createdAt: '2026-08-27T16:42:00+08:00', updatedAt: '2026-08-27T16:42:00+08:00', categoryId: 9, amount: 75 },

  // 8/28
  { occurredAt: '2026-08-28', createdAt: '2026-08-28T17:49:00+08:00', updatedAt: '2026-08-28T17:49:00+08:00', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-28', createdAt: '2026-08-28T18:56:00+08:00', updatedAt: '2026-08-28T18:56:00+08:00', categoryId: 7, amount: 140 },
  { occurredAt: '2026-08-28', createdAt: '2026-08-28T19:03:00+08:00', updatedAt: '2026-08-28T19:03:00+08:00', categoryId: 8, amount: 520, note: '和大學同學聚餐，吃完飯又去附近咖啡廳聊天，最後還一起搭計程車回家' },
  { occurredAt: '2026-08-28', createdAt: '2026-08-28T20:10:00+08:00', updatedAt: '2026-08-28T20:55:00+08:00', categoryId: 2, amount: 3000, tagIds: [201] },
  { occurredAt: '2026-08-28', createdAt: '2026-08-28T08:17:00+08:00', updatedAt: '2026-08-28T08:17:00+08:00', categoryId: 11, amount: 880, note: '生日禮物' },
  { occurredAt: '2026-08-28', createdAt: '2026-08-28T09:24:00+08:00', updatedAt: '2026-08-28T09:24:00+08:00', categoryId: 10, amount: 190 },

  // 8/29
  { occurredAt: '2026-08-29', createdAt: '2026-08-29T10:31:00+08:00', updatedAt: '2026-08-29T10:31:00+08:00', categoryId: 6, amount: 90 },
  { occurredAt: '2026-08-29', createdAt: '2026-08-29T11:38:00+08:00', updatedAt: '2026-08-29T11:38:00+08:00', categoryId: 7, amount: 165 },
  { occurredAt: '2026-08-29', createdAt: '2026-08-29T12:45:00+08:00', updatedAt: '2026-08-29T12:45:00+08:00', categoryId: 8, amount: 280 },
  { occurredAt: '2026-08-29', createdAt: '2026-08-29T13:52:00+08:00', updatedAt: '2026-08-29T13:52:00+08:00', categoryId: 12, amount: 590, tagIds: [1202] },
  { occurredAt: '2026-08-29', createdAt: '2026-08-29T14:59:00+08:00', updatedAt: '2026-08-29T14:59:00+08:00', categoryId: 9, amount: 120 },

  // 8/30
  { occurredAt: '2026-08-30', createdAt: '2026-08-30T15:06:00+08:00', updatedAt: '2026-08-30T15:06:00+08:00', categoryId: 6, amount: 70 },
  { occurredAt: '2026-08-30', createdAt: '2026-08-30T16:13:00+08:00', updatedAt: '2026-08-30T16:13:00+08:00', categoryId: 7, amount: 180 },
  { occurredAt: '2026-08-30', createdAt: '2026-08-30T17:20:00+08:00', updatedAt: '2026-08-30T17:20:00+08:00', categoryId: 8, amount: 250 },
  { occurredAt: '2026-08-30', createdAt: '2026-08-30T18:27:00+08:00', updatedAt: '2026-08-30T18:27:00+08:00', categoryId: 19, amount: 450, tagIds: [1902] },
  { occurredAt: '2026-08-30', createdAt: '2026-08-30T19:34:00+08:00', updatedAt: '2026-08-30T19:34:00+08:00', categoryId: 20, amount: 320, tagIds: [2001, 2003] },

  // 8/31
  { occurredAt: '2026-08-31', createdAt: '2026-08-31T20:41:00+08:00', updatedAt: '2026-08-31T21:26:00+08:00', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-31', createdAt: '2026-08-31T08:48:00+08:00', updatedAt: '2026-08-31T08:48:00+08:00', categoryId: 7, amount: 125 },
  { occurredAt: '2026-08-31', createdAt: '2026-08-31T09:55:00+08:00', updatedAt: '2026-08-31T09:55:00+08:00', categoryId: 8, amount: 680, note: '月底聚餐人數比預期多，又臨時加點了好幾道菜和甜點，所以最後分攤的金額比原本估計高' },
  { occurredAt: '2026-08-31', createdAt: '2026-08-31T10:02:00+08:00', updatedAt: '2026-08-31T10:02:00+08:00', categoryId: 21, amount: 500, tagIds: [2101] },
]

export const useRecordStore = defineStore('record', () => {
  const recordList: Ref<RecordItem[]> = ref(recordSeeds.map((record, index) => {
    return {
      id: index + 1,
      categoryId: record.categoryId,
      tagIds: record.tagIds ?? [],
      note: record.note ?? '',
      amount: record.amount,
      isAutomatic: record.isAutomatic ?? false,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      occurredAt: record.occurredAt,
    }
  }))

  const getRecordsByMonth = (year: number, month: number) => {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`

    return recordList.value.filter(record => record.occurredAt.startsWith(monthKey))
  }

  const addRecord = (recordData: RecordData) => {
    const timestamp = new Date().toISOString()
    const record: RecordItem = {
      ...recordData,
      id: Math.max(0, ...recordList.value.map(record => record.id)) + 1,
      tagIds: [...recordData.tagIds],
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    recordList.value.push(record)

    return record
  }

  const updateRecord = (recordId: number, recordData: RecordData) => {
    const record = recordList.value.find(record => record.id === recordId)

    if (!record) return false

    record.categoryId = recordData.categoryId
    record.tagIds = [...recordData.tagIds]
    record.note = recordData.note
    record.amount = recordData.amount
    record.isAutomatic = recordData.isAutomatic
    record.occurredAt = recordData.occurredAt
    record.updatedAt = new Date().toISOString()

    return true
  }

  return {
    recordList,
    getRecordsByMonth,
    addRecord,
    updateRecord,
  }
})
