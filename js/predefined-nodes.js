window.PREDEFINED_NODES = [
  {
    "tool": "fastqc",
    "subcommand": "fastqc",
    "input_dir": { "fastq": "/work/input/fq" },
    "output_dir": "/work/output/00_ReadQC/QC_Report_Before_Trimming",
    
    "params": { "fastqc_path": "fastqc", "threads": 4, "flag": 0, "file_pattern": "*.fastq*" }
  },
  {
    "tool": "multiqc",
    "subcommand": "multiqc",
    "input_dir": { "input": "/work/output/00_ReadQC/QC_Report_Before_Trimming" },
    "output_dir": "/work/output/00_ReadQC/QC_Report_Before_Trimming",
    
    "dependencies": [1],
    "params": { "multiqc_path": "multiqc" }
  },
  {
    "tool": "trim_galore",
    "subcommand": "trim_galore",
    "input_dir": { "fastq": "/work/input/fq" },
    "output_dir": "/work/output/00_ReadQC/TrimmedData",
    
    "params": { "trim_galore_path": "trim_galore", "cores": 4, "additional_params": "", "paired_pattern": "*_1.*" }
  },
  {
    "tool": "fastqc",
    "subcommand": "fastqc",
    "input_dir": { "trimmed_data": "/work/output/00_ReadQC/TrimmedData" },
    "output_dir": "/work/output/00_ReadQC/QC_Report_After_Trimming",
    
    "dependencies": [3],
    "params": { "fastqc_path": "fastqc", "threads": 8, "flag": 1, "file_pattern": "*_val_*.fq.gz" }
  },
  {
    "tool": "multiqc",
    "subcommand": "multiqc",
    "input_dir": { "input": "/work/output/00_ReadQC/QC_Report_After_Trimming" },
    "output_dir": "/work/output/00_ReadQC/QC_Report_After_Trimming",
    
    "parallelize": true,
    "dependencies": [4],
    "params": { "multiqc_path": "multiqc" }
  },
  {
    "tool": "bwa",
    "subcommand": "index",
    "input_dir": { "reference": "/work/input/ref" },
    "output_dir": "/work/output/01_ReadMapping/01_Indexing",
    
    "dependencies": [5],
    "params": { "bwa_path": "bwa", "threads": 20, "reference": "/work/input/ref/cow.chr1.fa", "prefix": "ref" }
  },
  {
    "tool": "bwa",
    "subcommand": "mem",
    "input_dir": { "base": "/work/output/00_ReadQC/TrimmedData" },
    "output_dir": "/work/output/01_ReadMapping/02_Mapping",
    
    "parallelize": true,
    "dependencies": [6],
    "params": {
      "bwa_path": "bwa",
      "threads": 4,
      "index_prefix": "/work/output/01_ReadMapping/01_Indexing/ref",
      "platform": "ILLUMINA",
      "breeds": ["Angus", "Hanwoo", "Holstein", "Jersey", "Simmental"],
      "samples": ["1", "2", "3", "4", "5"]
    }
  },
  {
    "tool": "samtools",
    "subcommand": "sort",
    "input_dir": { "input_sam": "/work/output/01_ReadMapping/02_Mapping" },
    "output_dir": "/work/output/01_ReadMapping/02_Mapping",
    
    "parallelize": true,
    "dependencies": [7],
    "params": {
      "samtools_path": "samtools",
      "threads": 4,
      "breeds": ["Angus", "Hanwoo", "Holstein", "Jersey", "Simmental"],
      "samples": ["1", "2", "3", "4", "5"]
    }
  },
  {
    "tool": "picard",
    "subcommand": "mark_duplicates",
    "input_dir": { "input_bam": "/work/output/01_ReadMapping/02_Mapping" },
    "output_dir": "/work/output/01_ReadMapping/03_Dedup",
    
    "parallelize": true,
    "dependencies": [8],
    "params": {
      "java_path": "java",
      "picard_path": "/opt/picard.jar",
      "memory": 4,
      "breeds": ["Angus", "Hanwoo", "Holstein", "Jersey", "Simmental"],
      "samples": ["1", "2", "3", "4", "5"]
    }
  },
  {
    "tool": "picard",
    "subcommand": "add_read_groups",
    "input_dir": { "input_bam": "/work/output/01_ReadMapping/03_Dedup" },
    "output_dir": "/work/output/01_ReadMapping/03_Dedup",
    
    "parallelize": true,
    "dependencies": [9],
    "params": {
      "java_path": "java",
      "picard_path": "/opt/picard.jar",
      "memory": 4,
      "platform": "ILLUMINA",
      "platform_unit": "UNIT1",
      "breeds": ["Angus", "Hanwoo", "Holstein", "Jersey", "Simmental"],
      "samples": ["1", "2", "3", "4", "5"]
    }
  },
  {
    "tool": "samtools",
    "subcommand": "faidx",
    "input_dir": { "reference": "/work/input/ref" },
    "output_dir": "/work/input/ref",
    
    "dependencies": [10],
    "params": { "tool_path": "samtools", "reference": "cow.chr1.fa" }
  },
  {
    "tool": "picard",
    "subcommand": "create_sequence_dictionary",
    "input_dir": { "reference": "/work/input/ref" },
    "output_dir": "/work/input/ref",
    
    "dependencies": [10],
    "params": { "java_path": "java", "picard_path": "/opt/picard.jar", "reference": "cow.chr1.fa" }
  },
  {
    "tool": "samtools",
    "subcommand": "local_realignment",
    "input_dir": { "bam": "/work/output/01_ReadMapping/03_Dedup" },
    "output_dir": "/work/output/01_ReadMapping/03_Dedup",
    
    "dependencies": [10],
    "params": { "tool_path": "samtools", "th": "5" }
  },
  {
    "tool": "gatk",
    "subcommand": "haplotype_caller",
    "parallelize": true,
    "input_dir": { "bam": "/work/output/01_ReadMapping/03_Dedup", "reference": "/work/input/ref" },
    "output_dir": "/work/output/02_VariantCalling",
    
    "dependencies": [11, 12, 13],
    "params": { "java_path": "java", "memory": "20", "tool_path": "gatk", "th": "5", "reference": "cow.chr1.fa" }
  },
  {
    "tool": "gatk",
    "subcommand": "combine_gvcfs",
    "input_dir": { "reference": "/work/input/ref", "gvcf": "/work/output/02_VariantCalling" },
    "output_dir": "/work/output/02_VariantCalling",
    
    "dependencies": [14],
    "params": { "java_path": "java", "memory": "20", "vcf_prefix": "test", "tool_path": "gatk", "reference": "cow.chr1.fa" }
  },
  {
    "tool": "gatk",
    "subcommand": "genotyping",
    "input_dir": { "reference": "/work/input/ref", "vcf": "/work/output/02_VariantCalling" },
    "output_dir": "/work/output/02_VariantCalling",
    
    "dependencies": [15],
    "params": { "java_path": "java", "memory": "20", "tool_path": "gatk", "vcf_prefix": "test", "reference": "cow.chr1.fa" }
  },
  {
    "tool": "gatk",
    "subcommand": "varint_selection",
    "input_dir": { "reference": "/work/input/ref", "vcf": "/work/output/02_VariantCalling" },
    "output_dir": "/work/output/02_VariantCalling",
    
    "dependencies": [16],
    "params": { "reference": "cow.chr1.fa", "vcf_prefix": "test", "java_path": "java", "tool_path": "gatk", "memory": "10" }
  },
  {
    "tool": "gatk",
    "subcommand": "variant_filtering",
    "input_dir": { "reference": "/work/input/ref", "vcf": "/work/output/02_VariantCalling" },
    "output_dir": "/work/output/02_VariantCalling",
    
    "dependencies": [17],
    "params": { "reference": "cow.chr1.fa", "vcf_prefix": "test", "java_path": "java", "tool_path": "gatk", "memory": "10", "filter_expression": "default" }
  },
  {
    "tool": "gatk",
    "subcommand": "select_variants",
    "input_dir": { "reference": "/work/input/ref", "vcf": "/work/output/02_VariantCalling" },
    "output_dir": "/work/output/02_VariantCalling",
    
    "dependencies": [18],
    "params": { "reference": "cow.chr1.fa", "vcf_prefix": "test", "java_path": "java", "tool_path": "gatk", "memory": "10" }
  },
  {
    "tool": "vcftools",
    "subcommand": "filter",
    "input_dir": { "vcf": "/work/output/02_VariantCalling" },
    "output_dir": "/work/output/03_PostProcessing/01_VcfFilter",
    
    "parallelize": false,
    "dependencies": [19],
    "params": { "vcftools_path": "vcftools", "vcf_prefix": "test" }
  },
  {
    "tool": "plink",
    "subcommand": "plink",
    "input_dir": { "vcf": "/work/output/03_PostProcessing/01_VcfFilter" },
    "output_dir": "/work/output/03_PostProcessing/02_Plink",
    
    "parallelize": false,
    "dependencies": [20],
    "params": { "plink_path": "plink", "geno": 0.01, "maf": 0.05, "hwe": "1e-06", "chr-set": 1, "vcf_prefix": "test" }
  },
  {
    "tool": "hapmap",
    "subcommand": "vcf2hapmap",
    "input_dir": { "vcf": "/work/output/03_PostProcessing/01_VcfFilter" },
    "output_dir": "/work/output/03_PostProcessing/03_Hapmap",
    
    "parallelize": false,
    "dependencies": [20],
    "params": { "perl_path": "perl", "vcf_prefix": "test" }
  }
]
